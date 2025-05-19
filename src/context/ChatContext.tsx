import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatState, ChatContextType, Message, Conversation, Language } from '@/types/chat';

const STORAGE_KEY = 'rupeeverse_chat_history';

const initialState: ChatState = {
  isOpen: false,
  isFullScreen: false,
  isHistoryOpen: false,
  currentLanguage: 'en',
  conversations: [],
  currentConversationId: null,
  isGenerating: false,
  abortController: null,
};

type ChatAction =
  | { type: 'SET_OPEN'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_HISTORY_OPEN'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_ABORT_CONTROLLER'; payload: AbortController | null }
  | { type: 'UPDATE_MESSAGE_FEEDBACK'; payload: { conversationId: string; messageId: string; feedback: 'positive' | 'negative' } }
  | { type: 'DELETE_CONVERSATION'; payload: string };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullScreen: action.payload };
    case 'SET_HISTORY_OPEN':
      return { ...state, isHistoryOpen: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, currentLanguage: action.payload };
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversationId: action.payload };
    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload;
      const updatedConversations = state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, messages: [...conv.messages, message], lastUpdated: Date.now() }
          : conv
      );
      return { ...state, conversations: updatedConversations };
    }
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_ABORT_CONTROLLER':
      return { ...state, abortController: action.payload };
    case 'UPDATE_MESSAGE_FEEDBACK': {
      const { conversationId, messageId, feedback } = action.payload;
      const updatedConversations = state.conversations.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.id === messageId ? { ...msg, feedback } : msg
              ),
            }
          : conv
      );
      return { ...state, conversations: updatedConversations };
    }
    case 'DELETE_CONVERSATION': {
      const updatedConversations = state.conversations.filter(
        conv => conv.id !== action.payload
      );
      return {
        ...state,
        conversations: updatedConversations,
        currentConversationId:
          state.currentConversationId === action.payload
            ? null
            : state.currentConversationId,
      };
    }
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load conversations from localStorage on mount
  React.useEffect(() => {
    const savedConversations = localStorage.getItem(STORAGE_KEY);
    if (savedConversations) {
      dispatch({ type: 'SET_CONVERSATIONS', payload: JSON.parse(savedConversations) });
    }
  }, []);

  // Save conversations to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.conversations));
  }, [state.conversations]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const message: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    let conversationId = state.currentConversationId;
    if (!conversationId) {
      conversationId = uuidv4();
      dispatch({
        type: 'SET_CURRENT_CONVERSATION',
        payload: conversationId,
      });
    }

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId, message },
    });

    // Create abort controller for the new request
    const abortController = new AbortController();
    dispatch({ type: 'SET_ABORT_CONTROLLER', payload: abortController });
    dispatch({ type: 'SET_GENERATING', payload: true });

    try {
      // TODO: Replace with actual API call
      const response = await fetch('https://upiconnect.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          language: state.currentLanguage,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId, message: assistantMessage },
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error sending message:', error);
        // Add error message to chat
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        };
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { conversationId, message: errorMessage },
        });
      }
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'SET_ABORT_CONTROLLER', payload: null });
    }
  }, [state.currentConversationId, state.currentLanguage]);

  const setLanguage = useCallback((language: Language) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  }, []);

  const toggleFullScreen = useCallback(() => {
    dispatch({ type: 'SET_FULLSCREEN', payload: !state.isFullScreen });
  }, [state.isFullScreen]);

  const toggleHistory = useCallback(() => {
    dispatch({ type: 'SET_HISTORY_OPEN', payload: !state.isHistoryOpen });
  }, [state.isHistoryOpen]);

  const closeChat = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: false });
    dispatch({ type: 'SET_FULLSCREEN', payload: false });
  }, []);

  const openChat = useCallback(() => {
    dispatch({ type: 'SET_OPEN', payload: true });
  }, []);

  const clearCurrentConversation = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: null });
  }, []);

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  }, []);

  const provideFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    if (!state.currentConversationId) return;
    dispatch({
      type: 'UPDATE_MESSAGE_FEEDBACK',
      payload: {
        conversationId: state.currentConversationId,
        messageId,
        feedback,
      },
    });
  }, [state.currentConversationId]);

  const value: ChatContextType = {
    ...state,
    sendMessage,
    setLanguage,
    toggleFullScreen,
    toggleHistory,
    closeChat,
    openChat,
    clearCurrentConversation,
    deleteConversation,
    provideFeedback,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 