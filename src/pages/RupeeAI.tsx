import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, ArrowLeft, Loader2, History, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import OpenAI from 'openai';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "sk-c589303b377b4b31ab61d43bc19b626a",
  defaultHeaders: {
    "HTTP-Referer": window.location.origin,
    "X-Title": "RupeeVerse",
  },
  dangerouslyAllowBrowser: true,
});

type ChatMessage = {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
};

const STORAGE_KEY = 'rupee_ai_conversations';

const RupeeAI = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      message: "Hello! I'm Rupee AI, your personal financial assistant. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const loadConversations = () => {
      try {
        const savedConversations = localStorage.getItem(STORAGE_KEY);
        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);
          
          // If there are conversations, set the most recent one as current
          if (parsedConversations.length > 0) {
            const mostRecent = parsedConversations.sort((a: Conversation, b: Conversation) => 
              b.lastUpdated - a.lastUpdated
            )[0];
            setCurrentConversationId(mostRecent.id);
            setChatMessages(mostRecent.messages);
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversation history');
      }
    };

    loadConversations();
  }, []);

  // Save conversations to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations:', error);
      toast.error('Failed to save conversation history');
    }
  }, [conversations]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const formatResponse = (response: string): string => {
    return response
      .replace(/\*(.*?)\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>')
      .replace(/\* \*\*/g, '<ul><li>')
      .replace(/\*\*/g, '</li></ul>')
      .replace(/\*+/g, '');
  };

  const simulateTypingEffect = (fullMessage: string, messageId: number) => {
    let currentIndex = 0;

    const typeNextCharacter = () => {
      if (currentIndex < fullMessage.length) {
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, message: fullMessage.slice(0, currentIndex + 1) }
              : msg
          )
        );
        currentIndex++;
        setTimeout(typeNextCharacter, 5);
      }
    };

    typeNextCharacter();
  };

  const fetchAIResponse = async (query: string): Promise<string> => {
    try {
      // Format the input for the API
      const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: query },
      ];

      // Call the DeepSeek API
      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages,
      });

      // Log the full response for debugging
      console.log("AI Response:", response);

      // Validate the response
      if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
        throw new Error("The AI did not return a valid response. Please try again.");
      }

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching AI response:", error);
      throw new Error("Failed to fetch a response from the AI. Please check your input or try again later.");
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [{
        id: 1,
        sender: 'ai',
        message: "Hello! I'm Rupee AI, your personal financial assistant. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }],
      lastUpdated: Date.now(),
    };
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
    setChatMessages(newConversation.messages);
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      setChatMessages(conversation.messages);
      setIsHistoryOpen(false);
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversationId === conversationId) {
      if (conversations.length > 1) {
        const nextConversation = conversations.find(conv => conv.id !== conversationId);
        if (nextConversation) {
          setCurrentConversationId(nextConversation.id);
          setChatMessages(nextConversation.messages);
        }
      } else {
        createNewConversation();
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const newUserMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const placeholderMessage: ChatMessage = {
        id: updatedMessages.length + 1,
        sender: "ai",
        message: '<span class="breathing">...</span>',
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, placeholderMessage]);

      const aiResponse = await fetchAIResponse(inputMessage);
      simulateTypingEffect(formatResponse(aiResponse), placeholderMessage.id);
    } catch (error: any) {
      toast.error(error.message || "An error occurred while processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 text-foreground">
      <Navbar />
      <main className="container px-4 mx-auto py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="font-poppins font-bold text-4xl mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Rupee AI Assistant
          </h1>
          <p className="text-muted-foreground text-lg">Your personal financial guide, powered by AI</p>
        </div>

        <div className="flex gap-4">
          {/* History Sidebar */}
          <AnimatePresence>
            {isHistoryOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 p-4 h-[calc(100vh-250px)] shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg">Conversations</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={createNewConversation}
                      className="hover:bg-white/5"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsHistoryOpen(false)}
                      className="hover:bg-white/5"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100%-60px)]">
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          "group p-3 rounded-xl cursor-pointer transition-all duration-200",
                          "hover:bg-white/5 border border-transparent",
                          currentConversationId === conv.id 
                            ? "bg-primary/10 border-primary/20" 
                            : "hover:border-white/10"
                        )}
                      >
                        <div 
                          className="flex items-center justify-between"
                          onClick={() => switchConversation(conv.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(conv.lastUpdated).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <div className="flex-1">
            <div className="bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-250px)] min-h-[500px] border border-white/10 shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-card/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Rupee AI</h3>
                    <p className="text-xs text-muted-foreground">Your Financial Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="hover:bg-white/5"
                  >
                    <History className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewConversation}
                    className="hover:bg-white/5"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl p-4 shadow-lg",
                        msg.sender === 'user'
                          ? "ml-auto bg-primary/20 border border-primary/20"
                          : "bg-card/50 border border-white/10 backdrop-blur-sm"
                      )}
                      dangerouslySetInnerHTML={{ __html: msg.message }}
                    />
                  ))}
                  <div ref={chatContainerRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-white/10 bg-card/30 backdrop-blur-sm">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about finance..."
                      className="w-full pr-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                      disabled={isProcessing}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={handleSendMessage}
                          disabled={isProcessing}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RupeeAI;