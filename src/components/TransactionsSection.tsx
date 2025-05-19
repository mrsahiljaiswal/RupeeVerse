import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  Coffee, 
  Wallet, 
  Plus, 
  Wifi, 
  WifiOff,
  Utensils,
  BookOpen,
  Pill,
  Home,
  Car,
  ShoppingCart,
  Plane,
  Gift,
  Heart,
  Briefcase,
  GraduationCap,
  Dumbbell,
  Gamepad2,
  Music,
  Film,
  Phone,
  Wrench,
  GiftIcon,
  Info,
  CheckCircle,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { getSecureAuthData } from '@/utils/secureAuthStorage';
import SendMoneyDialog from '@/components/SendMoneyDialog';

const API_BASE_URL = 'https://upiconnect.onrender.com';
type Transaction = {
  transactionId: string;
  amount: number;
  type: 'credited' | 'debited';
  note: string;
  status: 'Success' | 'Pending' | 'Failed';
  sender: string;
  receiver: string;
  transactionDate: string;
};

type ExpenseCategory = {
  category: string;
  amount: number;
  paymentMode: 'online' | 'offline';
};

type ExpenseData = {
  currentMonth: {
    total: number;
    categories: ExpenseCategory[];
  };
  lastMonth: {
    total: number;
    categories: ExpenseCategory[];
  };
};

type Notification = {
  id: number;
  type: 'transaction' | 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type CategoryIcon = {
  icon: React.ElementType;
  keywords: string[];
};

const categoryIcons: CategoryIcon[] = [
  { icon: Utensils, keywords: ['food', 'restaurant', 'dining', 'meal'] },
  { icon: ShoppingCart, keywords: ['grocery', 'shopping', 'market', 'store'] },
  { icon: Pill, keywords: ['medicine', 'health', 'medical', 'pharmacy'] },
  { icon: BookOpen, keywords: ['study', 'education', 'books', 'course'] },
  { icon: Home, keywords: ['rent', 'housing', 'mortgage', 'property'] },
  { icon: Car, keywords: ['transport', 'fuel', 'gas', 'vehicle'] },
  { icon: Plane, keywords: ['travel', 'flight', 'trip', 'vacation'] },
  { icon: Gift, keywords: ['gift', 'present', 'donation'] },
  { icon: Heart, keywords: ['healthcare', 'hospital', 'clinic'] },
  { icon: Briefcase, keywords: ['business', 'work', 'office'] },
  { icon: GraduationCap, keywords: ['education', 'school', 'college', 'university'] },
  { icon: Dumbbell, keywords: ['fitness', 'gym', 'sports', 'exercise'] },
  { icon: Gamepad2, keywords: ['entertainment', 'games', 'gaming'] },
  { icon: Music, keywords: ['music', 'concert', 'show'] },
  { icon: Film, keywords: ['movie', 'cinema', 'theatre'] },
  { icon: Phone, keywords: ['mobile', 'phone', 'communication'] },
  { icon: Wrench, keywords: ['maintenance', 'repair', 'service'] },
  { icon: ShoppingBag, keywords: ['shopping', 'retail', 'purchase'] },
  { icon: Coffee, keywords: ['cafe', 'coffee', 'beverage'] },
];

const getCategoryIcon = (category: string): React.ElementType => {
  const normalizedCategory = category.toLowerCase();
  const matchedIcon = categoryIcons.find(({ keywords }) =>
    keywords.some(keyword => normalizedCategory.includes(keyword))
  );
  return matchedIcon?.icon || ShoppingBag; // Default to ShoppingBag if no match
};

const getTransactionIcon = (type: Transaction['type']): React.ElementType => {
  switch (type) {
    case 'credited':
      return ArrowDownLeft;
    case 'debited':
      return ArrowUpRight;
    default:
      return ShoppingBag;
  }
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isPositive = transaction.type === 'credited';
  const Icon = getTransactionIcon(transaction.type);
  
  const getStatusBadge = () => {
    switch(transaction.status) {
      case 'Success':
        return <span className="badge badge-green">Completed</span>;
      case 'Pending':
        return <span className="badge bg-yellow-500/20 text-yellow-500">Pending</span>;
      case 'Failed':
        return <span className="badge bg-red-500/20 text-red-500">Failed</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPositive ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-500'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div>
          <p className="font-medium">{transaction.note}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.type === 'credited' ? `From: ${transaction.sender}` : `To: ${transaction.receiver}`}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(transaction.transactionDate)}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <p className={`font-medium ${isPositive ? 'text-emerald' : 'text-red-500'}`}>
          {isPositive ? '+' : '-'}₹{transaction.amount.toLocaleString()}
        </p>
        {getStatusBadge()}
      </div>
    </div>
  );
};

const getNotificationIcon = (type: Notification['type']): React.ElementType => {
  switch (type) {
    case 'transaction':
      return Wallet;
    case 'alert':
      return WifiOff;
    case 'info':
      return Info;
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertTriangle;
    default:
      return Bell;
  }
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const Icon = getNotificationIcon(notification.type);
  
  return (
    <div className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-0 ${
      !notification.read ? 'bg-white/5' : ''
    }`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        notification.type === 'success' ? 'bg-emerald/20 text-emerald' :
        notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
        notification.type === 'alert' ? 'bg-red-500/20 text-red-500' :
        'bg-primary/20 text-primary'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1">
        <p className="font-medium">{notification.title}</p>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notification.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const TransactionsSection = () => {
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    try {
      const secureData = getSecureAuthData();
      if (!secureData) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${secureData.token}`,
        },
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        // Sort transactions by date in descending order (newest first)
        const sortedTransactions = data.data.sort((a: Transaction, b: Transaction) => 
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        );
        setTransactions(sortedTransactions);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      const secureData = getSecureAuthData();
      if (!secureData) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${secureData.token}`,
        },
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setExpenseData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch expenses');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch expenses',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchTransactions();
  }, []);

  const topCategories = expenseData?.currentMonth.categories
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3) || [];

  return (
    <section id="transactions-section" className="py-16 md:py-24 bg-secondary/50 backdrop-blur-sm">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
            Track Every Transaction, <span className="text-primary">Even Offline</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Your transactions are securely stored, even without internet connectivity, and synced when you're back online.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-gradient rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-poppins font-medium text-lg">Recent Transactions</h3>
              <div className="badge badge-purple flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                Offline Available
              </div>
            </div>
            
            <div className="max-h-96 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TransactionItem key={transaction.transactionId} transaction={transaction} />
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No transactions found
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-white/10 text-center">
              <Button variant="link" className="text-primary">View All Transactions</Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="card-gradient rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-poppins font-medium text-lg">Transaction Stats</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="purple-gradient">
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <AddTransactionForm onSuccess={fetchTransactions} />
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-sm text-muted-foreground mb-2">This Month</h4>
                  <p className="font-poppins font-medium text-2xl">
                    ₹{loading ? '...' : expenseData?.currentMonth.total.toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-sm text-muted-foreground mb-2">Last Month</h4>
                  <p className="font-poppins font-medium text-2xl">
                    ₹{loading ? '...' : expenseData?.lastMonth.total.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm text-muted-foreground mb-4">Spending Categories</h4>
                
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          {React.createElement(getCategoryIcon(category.category), {
                            className: "w-4 h-4 text-primary"
                          })}
                          <span className="capitalize">{category.category}</span>
                        </div>
                        <span>₹{category.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full purple-gradient rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(category.amount / (expenseData?.currentMonth.total || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="card-gradient rounded-2xl p-6 flex items-center gap-6">
              <div className="w-12 h-12 rounded-full green-gradient flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-poppins font-medium text-lg">Need to send money offline?</h3>
                <p className="text-muted-foreground">Use our peer-to-peer feature to transfer funds locally.</p>
              </div>
              
              <Button className="green-gradient"  onClick={() => setShowSendDialog(true)}>Try Now</Button>
            </div>
          </div>
        </div>
      </div>
      
      <SendMoneyDialog 
        open={showSendDialog} 
        onOpenChange={setShowSendDialog} 
      />
    </section>
  );
};

const AddTransactionForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      amount: 0,
      paymentMode: 'online',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const secureData = getSecureAuthData();
      if (!secureData) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Normalize category to lowercase for consistency
      const normalizedValues = {
        ...values,
        category: values.category.toLowerCase(),
      };

      const response = await fetch(`${API_BASE_URL}/api/expenses/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secureData.token}`,
        },
        body: JSON.stringify(normalizedValues),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Transaction added successfully',
          className: 'bg-green-500 text-white',
        });
        onSuccess();
      } else {
        throw new Error(data.message || 'Failed to add transaction');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add transaction',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Enter category" {...field} />
                  {field.value && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {React.createElement(getCategoryIcon(field.value), {
                        className: "w-5 h-5 text-primary"
                      })}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  {...field} 
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Mode</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full purple-gradient">
          Add Transaction
        </Button>
      </form>
    </Form>
  );
};

const formSchema = z.object({
  category: z.string().min(2, 'Category must be at least 2 characters'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMode: z.enum(['online', 'offline']),
});

export default TransactionsSection;
