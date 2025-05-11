
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Mic, Send, ArrowLeft, MessageSquare, Plus, Wallet, Bell, VolumeX, Play, Upload, ChevronDown, CircleCheck, FileText, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";

type ChatMessage = {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
};

type TransactionData = {
  recentTransactions: {
    id: number;
    description: string;
    amount: number;
    date: string;
  }[];
  spendingCategories: {
    [key: string]: number;
  };
};

// Financial news and data for the AI assistant
const financialNews = [
  {
    title: "RBI Maintains Status Quo on Policy Rates for Fifth Time in a Row",
    date: "2025-04-12",
    summary: "The Reserve Bank of India (RBI) kept the policy repo rate unchanged at 6.5% for the fifth consecutive time, maintaining its stance of 'withdrawal of accommodation' to ensure inflation progressively aligns with the target while supporting growth."
  },
  {
    title: "Indian Stock Market Hits All-Time High as Foreign Investments Surge",
    date: "2025-04-10",
    summary: "Indian benchmark indices reached record highs today as foreign portfolio investors pumped in over $3 billion this month, showing renewed confidence in the Indian economy's growth trajectory."
  },
  {
    title: "Government Announces New Tax Benefits for StartUps and MSMEs",
    date: "2025-04-08",
    summary: "The Finance Ministry has announced additional tax benefits for startups and MSMEs to boost entrepreneurship and small businesses, including tax holidays for the first three years of operation and simplified GST compliance."
  },
  {
    title: "Digital Rupee Pilot Expands to 15 More Cities",
    date: "2025-04-05",
    summary: "RBI has expanded its CBDC pilot to 15 additional cities, making the Digital Rupee accessible to more citizens and businesses. Transaction limits have been increased to ₹10,000 per day."
  }
];

const generateAIResponse = (query: string, data?: any) => {
  // Simplified AI response generation based on query keywords
  const query_lower = query.toLowerCase();
  
  // Check for financial news related queries
  if (query_lower.includes('news') || query_lower.includes('recent') || query_lower.includes('latest') || query_lower.includes('update')) {
    const news = financialNews[Math.floor(Math.random() * financialNews.length)];
    return `Here's the latest financial news: "${news.title}" (${news.date}): ${news.summary}`;
  }
  
  // Investment related queries
  if (query_lower.includes('invest') || query_lower.includes('stock') || query_lower.includes('mutual fund') || query_lower.includes('portfolio')) {
    return "Based on current market trends, diversified equity mutual funds are showing strong performance. For long-term investors, I recommend allocating 60-70% to equity, 20-30% to debt, and 5-10% to gold. Remember that asset allocation should be based on your risk profile and investment horizon.";
  }
  
  // Tax related queries
  if (query_lower.includes('tax') || query_lower.includes('savings') || query_lower.includes('80c') || query_lower.includes('income tax')) {
    return "For tax savings in India, you can invest up to ₹1.5 lakh under Section 80C through instruments like PPF, ELSS funds, NPS, or tax-saving FDs. Additionally, you can claim deductions for health insurance premiums under Section 80D, and home loan interest under Section 24. Based on the latest budget, there are also special provisions for first-time homebuyers.";
  }
  
  // If it's document related data
  if (data && data.isDocumentSummary) {
    return data.summary;
  }
  
  // Bank account or UPI related
  if (query_lower.includes('account') || query_lower.includes('upi') || query_lower.includes('payment') || query_lower.includes('transfer')) {
    return "Your primary savings account has a balance of ₹24,500. You've spent ₹15,300 this month, which is 12% less than last month. Your recurring deposit of ₹5,000 will be debited on the 20th. For UPI payments, you have a daily transaction limit of ₹1,00,000.";
  }
  
  // Insurance related
  if (query_lower.includes('insurance') || query_lower.includes('policy') || query_lower.includes('claim') || query_lower.includes('premium')) {
    return "Based on your profile, I recommend a term insurance coverage of at least 10 times your annual income (approximately ₹60 lakhs) and a comprehensive health insurance of ₹10 lakhs. With your current policies, you have adequate life coverage but might want to consider enhancing your health insurance to include critical illness coverage.";
  }
  
  // Generic response for other queries
  return "I've analyzed the financial information you've shared. Currently, the market shows moderate volatility with interest rates stabilizing. For personalized investment advice, I would need more details about your financial goals and risk appetite. Would you like me to help you create a detailed financial plan?";
};

const RupeeAI = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      message: "Hello! I'm Rupee AI, your personal financial assistant. To provide you with personalized advice, would you be willing to share some financial context like recent transactions or your financial goals?",
      timestamp: "4:30 PM"
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('offline');
  const [hasSharedData, setHasSharedData] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const curatedQuestions = {
    budgeting: [
      "How can I create a monthly budget?",
      "Where am I overspending?",
      "How much should I save each month?",
      "What are my largest expenses?"
    ],
    investment: [
      "How should I start investing?",
      "What investment options are good for beginners?",
      "Should I invest in mutual funds or stocks?",
      "How do I build an emergency fund?"
    ],
    loans: [
      "What loan options are available to me?",
      "How can I improve my credit score?",
      "Should I refinance my existing loans?",
      "What's the best way to pay off my debt?"
    ]
  };

  // Enhanced sending message functionality
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const newUserMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      let aiResponse = '';
      
      // Simple response logic based on user input
      const userInput = inputMessage.toLowerCase();
      
      if (activeTab === 'offline') {
        if (userInput.includes('balance') || userInput.includes('account')) {
          aiResponse = "Your current account balance is ₹**,***.**. You have no pending transactions.";
        } else if (userInput.includes('send money') || userInput.includes('transfer')) {
          aiResponse = "I can help you send money even without internet. To whom would you like to send money, and how much? When you go offline, I'll use SMS or USSD to complete the transaction.";
        } else if (userInput.includes('loan') || userInput.includes('borrow')) {
          aiResponse = "Based on your account history, you're eligible for a personal loan up to ₹50,000 with 8.5% interest rate. I can process your application offline and notify you when connectivity is restored. Would you like to learn more about our loan options?";
        } else if (userInput.includes('save') || userInput.includes('saving')) {
          aiResponse = "You've been saving about ₹2,000 monthly. I suggest increasing it to ₹3,000 to meet your house down payment goal by next year. I can set up automatic savings even when you're offline.";
        } else if (userInput.includes('upi') || userInput.includes('payment')) {
          aiResponse = "I can process UPI payments even without internet connectivity using our proprietary offline processing system. Would you like me to set up an offline payment now?";
        } else if (userInput.includes('help') || userInput.includes('advice')) {
          if (!hasSharedData) {
            aiResponse = "To provide personalized financial advice, I'd need to understand your spending patterns. Would you be willing to share your recent transactions or financial goals?";
          } else {
            aiResponse = "Based on your transaction history, I notice you spend about 35% of your income on essentials and 15% on discretionary items. This is within healthy limits! To reach your savings goals faster, consider reducing restaurant spending by ₹500 monthly.";
          }
        } else if (userInput.includes('hello') || userInput.includes('hi')) {
          aiResponse = "Hello! I'm your Rupee AI financial assistant that works even offline. I can help you with balance inquiries, money transfers, UPI payments, and personalized financial advice, all without requiring internet connectivity. How may I assist you today?";
        } else {
          aiResponse = "I understand you're asking about " + inputMessage + ". Even while offline, I can help you with most banking operations including checking balances, transferring funds, and processing UPI payments. Would you like specific assistance with this query?";
        }
      } else {
        // Online chatbot with more comprehensive responses using the AI response generator
        aiResponse = generateAIResponse(userInput);
      }
      
      const newAiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        sender: 'ai',
        message: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, newAiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // File drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Check file type
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast.error("Please upload a PDF, Excel, or CSV file");
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    
    setSelectedFile(file);
  };
  
  const handleFileUpload = () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    // Simulate processing and generate document summary
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedFile(null);
      handleShareTransactions();
      
      // Generate document summary based on file type
      let documentSummary = "";
      
      if (selectedFile.name.endsWith('.pdf')) {
        documentSummary = generateDocumentSummary(selectedFile.name, 'pdf');
      } else if (selectedFile.name.endsWith('.xlsx')) {
        documentSummary = generateDocumentSummary(selectedFile.name, 'excel');
      } else if (selectedFile.name.endsWith('.csv')) {
        documentSummary = generateDocumentSummary(selectedFile.name, 'csv');
      }
      
      // Add AI message with document summary
      const newAiMessage: ChatMessage = {
        id: chatMessages.length + 1,
        sender: 'ai',
        message: documentSummary,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, newAiMessage]);
      toast.success("Bank statement processed successfully");
    }, 2000);
  };
  
  // Generate document summary based on file type
  const generateDocumentSummary = (fileName: string, fileType: string) => {
    // In a real implementation, this would use actual document processing
    // Here we simulate different summaries based on file type
    
    if (fileType === 'pdf') {
      return `📄 **Document Summary: ${fileName}**\n\nI've analyzed your bank statement and found:\n\n• Total Income: ₹62,500\n• Total Expenses: ₹43,200\n• Largest Expense Category: Housing (₹15,000)\n• Recurring Subscriptions: ₹2,400\n• Unusual Transaction: ₹5,000 withdrawal on April 8th\n\nYour spending has increased by 12% compared to last month, primarily in the dining and entertainment categories. Would you like me to suggest some budgeting strategies to help optimize your spending?`;
    } else if (fileType === 'excel') {
      return `📊 **Excel Analysis: ${fileName}**\n\nYour financial spreadsheet shows:\n\n• Current Assets: ₹3,45,000\n• Liabilities: ₹1,20,000\n• Net Worth: ₹2,25,000\n• Monthly Savings Rate: 22%\n• Investment Returns: 8.5% annual\n\nBased on your current savings rate and investment returns, you're on track to reach your retirement goal of ₹2 crore in approximately 18 years. Would you like me to suggest ways to potentially accelerate this timeline?`;
    } else {
      return `📈 **CSV Data Analysis: ${fileName}**\n\nI've processed your transaction data:\n\n• Transactions Analyzed: 42\n• Time Period: March 1 - April 15, 2025\n• Average Daily Spend: ₹1,200\n• Highest Spending Day: April 2nd (₹5,400)\n• Top 3 Merchants: Grocery Mart, Urban Transport, CoffeeCo\n\nYou might be able to save approximately ₹3,500 monthly by optimizing your subscription services and food delivery expenses. Would you like a detailed breakdown of potential savings?`;
    }
  };
  
  const handleCancelUpload = () => {
    setSelectedFile(null);
  };
  
  // Bank connection handlers
  const handleConnectBank = () => {
    if (!bankName || !accountNumber) {
      toast.error("Please enter both bank name and account number");
      return;
    }
    
    setIsConnectingBank(true);
    
    // Simulate connection process
    setTimeout(() => {
      setIsConnectingBank(false);
      handleShareTransactions();
      
      // Add AI message acknowledging bank connection
      const newAiMessage: ChatMessage = {
        id: chatMessages.length + 1,
        sender: 'ai',
        message: `I've successfully connected to your ${bankName} account ending in ${accountNumber.slice(-4)}. Here's a summary of your account:\n\n• Current Balance: ₹42,500\n• Available Credit: ₹85,000\n• Last 5 Transactions Total: ₹12,340\n• Upcoming Bill Payment: ₹3,500 (Electricity) due on April 20th\n\nWould you like me to set up alerts for large transactions or help you analyze your spending patterns?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => [...prev, newAiMessage]);
      toast.success(`Successfully connected to ${bankName}`);
    }, 2000);
  };

  // Voice recognition simulation
  const toggleListening = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      toast.info("Listening... Speak now");
      
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        setIsListening(false);
        const voiceCommands = [
          "What's my current balance?",
          "Send money to Mom",
          "How much did I spend last week?",
          "Help me save money"
        ];
        const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
        setInputMessage(randomCommand);
        
        // Auto send after a short delay
        setTimeout(() => {
          handleSendMessage();
        }, 500);
      }, 3000);
    }
  };
  
  const handleShareTransactions = () => {
    // Simulate transaction data being shared
    setHasSharedData(true);
    setTransactionData({
      recentTransactions: [
        { id: 1, description: 'Grocery Store', amount: -2500, date: '2025-04-08' },
        { id: 2, description: 'Salary Deposit', amount: 45000, date: '2025-04-01' },
        { id: 3, description: 'Restaurant Payment', amount: -1200, date: '2025-04-06' },
        { id: 4, description: 'Mobile Recharge', amount: -499, date: '2025-04-05' }
      ],
      spendingCategories: {
        Food: 3700,
        Transport: 2200,
        Entertainment: 1500,
        Utilities: 3000
      }
    });
    
    // Add AI message acknowledging the shared data
    const newAiMessage: ChatMessage = {
      id: chatMessages.length + 1,
      sender: 'ai',
      message: "Thank you for sharing your transaction data! I see you've spent ₹2,500 on groceries recently and received your salary of ₹45,000. Based on your spending patterns, I notice you spend about 8% on food, 5% on transport, and 3% on entertainment. Would you like some advice on how to optimize your budget?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, newAiMessage]);
  };
  
  const suggestionChips = [
    "Check my balance",
    "Send money to Priya",
    "Process offline payment",
    "How much did I spend last week?",
    "Help me save money"
  ];
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container px-4 mx-auto py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="font-poppins font-bold text-3xl mb-2">Rupee AI Assistant</h1>
          <p className="text-muted-foreground">Your personal financial guide, available offline and online</p>
        </div>

        <Tabs defaultValue="offline" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="offline">
              <VolumeX className="mr-2 h-4 w-4" />
              Offline Assistant
            </TabsTrigger>
            <TabsTrigger value="online">
              <MessageSquare className="mr-2 h-4 w-4" />
              Online Finance Expert
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-gradient rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-250px)] min-h-[500px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  {activeTab === 'offline' ? <VolumeX className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium">
                    {activeTab === 'offline' ? 'Rupee AI Offline' : 'Rupee Finance Expert'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === 'offline' ? 'Works without internet' : 'Comprehensive financial advice'}
                  </p>
                </div>
              </div>
              
              <div className="badge badge-purple flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                {activeTab === 'offline' ? 'Offline Mode' : 'Online Mode'}
              </div>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[80%] ${
                    msg.sender === 'user' ? 'ml-auto bg-primary/20' : 'bg-card'
                  } rounded-2xl p-3`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.message}</p>
                  <p className="text-xs text-muted-foreground text-right mt-1">{msg.timestamp}</p>
                </div>
              ))}
              
              {isListening && (
                <div className="flex justify-center my-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2 relative">
                      <Mic className="w-6 h-6" />
                      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
                    </div>
                    <p className="text-sm text-muted-foreground">Listening...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {suggestionChips.map((chip, index) => (
                  <button 
                    key={index}
                    className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-sm"
                    onClick={() => {
                      setInputMessage(chip);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`bg-white/5 border-white/10 hover:bg-white/10 ${isListening ? 'bg-primary/20 text-primary animate-pulse' : ''}`}
                  onClick={toggleListening}
                >
                  <Mic className="h-5 w-5" />
                </Button>
                
                <div className="relative flex-1">
                  <input 
                    type="text" 
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
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Enhance your experience</SheetTitle>
                      <SheetDescription>Share data or explore curated topics</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Share financial data</h3>
                        <p className="text-sm text-muted-foreground">
                          Share your financial data securely to get personalized insights
                        </p>
                        <div className="flex gap-3 mt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Bank Statement
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload bank statement</DialogTitle>
                                <DialogDescription>
                                  Your data is encrypted and will only be used to provide personalized advice
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedFile ? (
                                <div className="space-y-4">
                                  <div className="flex items-center p-3 bg-white/5 border border-white/10 rounded-lg">
                                    <FileText className="h-8 w-8 text-muted-foreground mr-3" />
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={handleCancelUpload}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button 
                                      onClick={handleFileUpload} 
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Processing...
                                        </>
                                      ) : (
                                        'Process Statement'
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </div>
                              ) : (
                                <>
                                  <div 
                                    className={`border-2 border-dashed ${dragActive ? 'border-primary bg-primary/10' : 'border-white/10'} rounded-lg p-8 text-center hover:bg-white/5 transition-colors cursor-pointer`}
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                  >
                                    <input 
                                      ref={fileInputRef}
                                      type="file" 
                                      accept=".pdf,.xlsx,.csv" 
                                      className="hidden" 
                                      onChange={handleFileInput}
                                    />
                                    <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                      {dragActive 
                                        ? "Drop your file here" 
                                        : "Drag and drop your bank statement PDF or Excel file here"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Maximum file size: 10MB
                                    </p>
                                    <Button className="mt-4">
                                      Select File
                                    </Button>
                                  </div>
                                  <div className="mt-2 text-xs text-center text-muted-foreground">
                                    By uploading, you agree to our <a href="#" className="text-primary hover:underline">data usage policy</a>
                                  </div>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline">Connect Bank Account</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Connect your bank account</DialogTitle>
                                <DialogDescription>
                                  Securely link your bank account to get personalized financial insights
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Select your bank</label>
                                  <select 
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                  >
                                    <option value="">Select a bank</option>
                                    <option value="SBI">State Bank of India</option>
                                    <option value="HDFC">HDFC Bank</option>
                                    <option value="ICICI">ICICI Bank</option>
                                    <option value="Axis">Axis Bank</option>
                                    <option value="BOB">Bank of Baroda</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Account number</label>
                                  <input 
                                    type="text" 
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    placeholder="Enter your account number"
                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </div>
                                
                                <div className="pt-2">
                                  <p className="text-xs text-muted-foreground">
                                    We use bank-level encryption to protect your credentials. We never store your login information.
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button 
                                  onClick={handleConnectBank}
                                  disabled={isConnectingBank || !bankName || !accountNumber}
                                >
                                  {isConnectingBank ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Connecting...
                                    </>
                                  ) : (
                                    'Connect Account'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Browse financial topics</h3>
                        <div className="space-y-3 mt-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium flex items-center">
                                <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                                Budgeting & Saving
                              </h4>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                            <div className="pl-4">
                              {curatedQuestions.budgeting.map((question, i) => (
                                <div 
                                  key={i} 
                                  className="text-sm py-1.5 cursor-pointer hover:text-primary text-muted-foreground"
                                  onClick={() => setInputMessage(question)}
                                >
                                  {question}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium flex items-center">
                                <span className="w-2 h-2 bg-emerald rounded-full mr-2"></span>
                                Investment Strategies
                              </h4>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                            <div className="pl-4">
                              {curatedQuestions.investment.map((question, i) => (
                                <div 
                                  key={i} 
                                  className="text-sm py-1.5 cursor-pointer hover:text-primary text-muted-foreground"
                                  onClick={() => setInputMessage(question)}
                                >
                                  {question}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <h4 className="text-sm font-medium flex items-center">
                                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                                Loans & Credit
                              </h4>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                            <div className="pl-4">
                              {curatedQuestions.loans.map((question, i) => (
                                <div 
                                  key={i} 
                                  className="text-sm py-1.5 cursor-pointer hover:text-primary text-muted-foreground"
                                  onClick={() => setInputMessage(question)}
                                >
                                  {question}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {transactionData && (
              <div className="card-gradient rounded-2xl p-6">
                <h3 className="font-poppins font-medium text-lg mb-4 flex items-center">
                  <CircleCheck className="mr-2 h-4 w-4 text-green-500" />
                  Shared Transaction Data
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Recent Transactions</p>
                    {transactionData.recentTransactions.map((tx: any) => (
                      <div key={tx.id} className="flex justify-between items-center py-2 border-b border-white/10">
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                        <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-500' : ''}`}>
                          ₹{Math.abs(tx.amount).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  View Full Analysis
                </Button>
              </div>
            )}
            
            {!transactionData && (
              <div className="card-gradient rounded-2xl p-6">
                <h3 className="font-poppins font-medium text-lg mb-4">Financial Snapshot</h3>
                
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="font-poppins font-bold text-2xl">₹ * * * * *</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Monthly Budget</span>
                      <span>₹15,000.00</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full green-gradient rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">₹9,000 remaining for this month</p>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  View Full Budget
                </Button>
              </div>
            )}
            
            <div className="card-gradient rounded-2xl p-6">
              <h3 className="font-poppins font-medium text-lg mb-4">{activeTab === 'offline' ? 'Offline AI Features' : 'Online Finance Expert'}</h3>
              
              <div className="space-y-3">
                {activeTab === 'offline' ? (
                  <>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-1">
                        <VolumeX className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Offline Mode</h4>
                        <p className="text-sm text-muted-foreground">Assistant works without internet connectivity</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald/20 text-emerald flex items-center justify-center mt-1">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Voice Commands</h4>
                        <p className="text-sm text-muted-foreground">Control by speaking in your local language</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-1">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Smart Alerts</h4>
                        <p className="text-sm text-muted-foreground">Get financial alerts even when offline</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-orange-400/20 text-orange-400 flex items-center justify-center mt-1">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Offline Payments</h4>
                        <p className="text-sm text-muted-foreground">Process UPI payments without internet</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-1">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Real-time Advice</h4>
                        <p className="text-sm text-muted-foreground">Access latest financial information and market trends</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-emerald/20 text-emerald flex items-center justify-center mt-1">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Document Analysis</h4>
                        <p className="text-sm text-muted-foreground">Upload statements for detailed insights</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-orange-400/20 text-orange-400 flex items-center justify-center mt-1">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">Financial News</h4>
                        <p className="text-sm text-muted-foreground">Latest market updates and economic news</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="card-gradient rounded-2xl p-6">
              <h3 className="font-poppins font-medium text-lg mb-4">How to Use Rupee AI</h3>
              <div className="aspect-video bg-muted/20 rounded-xl flex items-center justify-center mb-4">
                <Button size="icon" className="rounded-full bg-primary/90 hover:bg-primary">
                  <Play className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Watch this quick tutorial to learn how to make the most of Rupee AI's features.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RupeeAI;
