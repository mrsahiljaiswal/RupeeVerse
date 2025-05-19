import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Maximize2, Minimize2, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import OpenAI from 'openai';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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",
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

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
      const formattedMessages = chatMessages.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message,
      }));

      formattedMessages.push({ role: 'user', content: query });

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: formattedMessages as any,
      });

      return response.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('Error fetching AI response:', error);
      throw new Error('Failed to connect to AI service. Please try again later.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const newUserMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      const placeholderMessage: ChatMessage = {
        id: chatMessages.length + 2,
        sender: 'ai',
        message: '<span class="breathing">...</span>',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, placeholderMessage]);

      const aiResponse = await fetchAIResponse(inputMessage);
      simulateTypingEffect(formatResponse(aiResponse), placeholderMessage.id);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while fetching the AI response.');
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

  if (!user) return null;

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg purple-gradient"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          "fixed z-50 bg-background border rounded-lg shadow-lg",
          isFullScreen
            ? "inset-4"
            : "bottom-6 right-6 w-[400px] h-[600px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">RupeeVerse AI</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 h-[calc(100%-180px)]">
          <ScrollArea className="h-full p-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] mb-4",
                  msg.sender === 'user' ? "ml-auto bg-primary/20" : "bg-card"
                )}
                dangerouslySetInnerHTML={{ __html: msg.message }}
              />
            ))}
            <div ref={chatContainerRef} />
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-primary hover:bg-transparent"
                onClick={handleSendMessage}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Chatbot; 