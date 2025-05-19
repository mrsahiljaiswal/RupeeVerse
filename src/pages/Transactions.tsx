import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Filter, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import OfflineUPISection from '@/components/OfflineUPISection';
import SendMoneyDialog from '@/components/SendMoneyDialog';
import { getSecureAuthData } from '@/utils/secureAuthStorage';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Transaction {
  transactionId: string;
  amount: number;
  type: 'credited' | 'debited';
  note: string;
  status: string;
  sender: string;
  receiver: string;
  transactionDate: string;
}

interface TransactionResponse {
  status: string;
  message: string;
  data: Transaction[];
}

interface BalanceResponse {
  status: string;
  message: string;
  data: {
    username: string;
    email: string;
    finalBalance: number;
  };
  timestamp: string;
}

const TransactionsList = () => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Predefined transactions for unauthenticated users
  const predefinedTransactions: Transaction[] = [
    {
      transactionId: "1",
      amount: 1200,
      type: "debited",
      note: "Monthly rent payment",
      status: "Success",
      sender: "You",
      receiver: "Ramesh Kumar",
      transactionDate: new Date().toISOString()
    },
    {
      transactionId: "2",
      amount: 2500,
      type: "credited",
      note: "Freelance work payment",
      status: "Success",
      sender: "Priya Sharma",
      receiver: "You",
      transactionDate: new Date(Date.now() - 86400000).toISOString()
    },
    // Add more predefined transactions as needed
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const secureData = getSecureAuthData();
        console.log('Auth data:', secureData); // Debug log

        if (!secureData?.token) {
          console.log('No auth token found, using predefined transactions'); // Debug log
          setTransactions(predefinedTransactions);
          setLoading(false);
          return;
        }

        console.log('Fetching transactions from API...'); // Debug log
        const response = await fetch('https://upiconnect.onrender.com/api/transactions', {
          headers: {
            'Authorization': `Bearer ${secureData.token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data: TransactionResponse = await response.json();
        console.log('Received transactions:', data); // Debug log

        if (data.status === 'success' && Array.isArray(data.data)) {
          setTransactions(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch transactions",
          variant: "destructive",
        });
        setTransactions(predefinedTransactions);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [toast]);

  const filteredTransactions = transactions.filter(transaction => {
    const typeMatch = filterType === 'all' || transaction.type === filterType;
    const statusMatch = filterStatus === 'all' || transaction.status === filterStatus;
    const dateMatch = filterDate === 'all' || new Date(transaction.transactionDate).toLocaleDateString().includes(filterDate);
    return typeMatch && statusMatch && dateMatch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString()}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString()}`;
    } else {
      return date.toLocaleString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-poppins font-medium text-xl">Recent Transactions</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-white/10"
          onClick={() => setShowFilterDialog(true)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-gradient rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-white/5 rounded" />
                    <div className="h-3 w-32 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.transactionId} className="card-gradient rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === 'credited' ? 'bg-emerald/20 text-emerald' : 'bg-rupee/20 text-rupee'
                  }`}>
                    {transaction.type === 'credited' ? (
                      <ArrowDownLeft className="w-6 h-6" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">
                      {transaction.type === 'credited' ? transaction.sender : transaction.receiver}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.note}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.transactionDate)}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <p className={`font-medium ${transaction.type === 'credited' ? 'text-emerald' : ''}`}>
                    {transaction.type === 'credited' ? '+' : '-'}₹{transaction.amount}
                  </p>
                  <span className={`badge ${
                    transaction.status === 'Success' ? 'badge-green' :
                    transaction.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="card-gradient">
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credited">Received</SelectItem>
                  <SelectItem value="debited">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="Today">Today</SelectItem>
                  <SelectItem value="Yesterday">Yesterday</SelectItem>
                  <SelectItem value="This Month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Transactions = () => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBalance = async () => {
    try {
      const secureData = getSecureAuthData();
      if (!secureData?.token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching balance...'); // Debug log
      const response = await fetch('https://upiconnect.onrender.com/api/balance', {
        headers: {
          'Authorization': `Bearer ${secureData.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data: BalanceResponse = await response.json();
      console.log('Balance data:', data); // Debug log

      if (data.status === 'success') {
        setBalance(data.data.finalBalance);
        setLastUpdated(data.timestamp);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchBalance();

    // Set up polling every 3 seconds
    const intervalId = setInterval(fetchBalance, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [toast]);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleString();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-poppins font-bold text-2xl">Transactions</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card-gradient rounded-2xl p-6">
              <TransactionsList />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="card-gradient rounded-2xl p-6">
              <h3 className="font-poppins font-medium text-lg mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-white/10 hover:bg-white/5"
                  onClick={() => setShowSendDialog(true)}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
                
                <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5">
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Request Money
                </Button>
                
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Available Balance</span>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                      {loading && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </div>
                  {loading ? (
                    <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">₹{balance?.toLocaleString()}</p>
                      {lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last updated: {formatLastUpdated(lastUpdated)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 rounded-2xl p-6">
              <h3 className="font-poppins font-medium text-lg mb-2">Offline Mode Active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your transactions are being stored locally and will sync when you're back online.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm">Offline Mode</span>
              </div>
            </div>
          </div>
        </div>
        
        <OfflineUPISection />
      </main>
      <Footer />

      <SendMoneyDialog 
        open={showSendDialog} 
        onOpenChange={setShowSendDialog} 
      />
    </div>
  );
};

export default Transactions;
