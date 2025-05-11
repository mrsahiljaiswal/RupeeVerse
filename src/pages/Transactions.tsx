import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';
import OfflineUPISection from '@/components/OfflineUPISection';
import SendMoneyDialog from '@/components/SendMoneyDialog';

type Transaction = {
  id: number;
  type: 'sent' | 'received' | 'payment';
  name: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  icon: React.ElementType;
  description?: string;
};

const TransactionsList = () => {
  const [showSendDialog, setShowSendDialog] = useState(false);
  
  const transactions: Transaction[] = [
    {
      id: 1,
      type: 'sent',
      name: 'Ramesh Kumar',
      amount: '₹1,200',
      date: 'Today, 10:45 AM',
      status: 'completed',
      icon: ArrowUpRight,
      description: 'Monthly rent payment'
    },
    {
      id: 2,
      type: 'received',
      name: 'Priya Sharma',
      amount: '₹2,500',
      date: 'Yesterday, 2:30 PM',
      status: 'completed',
      icon: ArrowDownLeft,
      description: 'Freelance work payment'
    },
    {
      id: 3,
      type: 'payment',
      name: 'Local Grocery',
      amount: '₹450',
      date: '24 Apr, 6:15 PM',
      status: 'completed',
      icon: ShoppingBag,
      description: 'Weekly groceries'
    },
    {
      id: 4,
      type: 'payment',
      name: 'Tea Stall',
      amount: '₹120',
      date: '23 Apr, 9:20 AM',
      status: 'completed',
      icon: Coffee,
      description: 'Morning tea with friends'
    },
    {
      id: 5,
      type: 'sent',
      name: 'Vikram Singh',
      amount: '₹800',
      date: '22 Apr, 11:30 AM',
      status: 'completed',
      icon: ArrowUpRight,
      description: 'Return borrowed money'
    },
    {
      id: 6,
      type: 'payment',
      name: 'Mobile Recharge',
      amount: '₹199',
      date: '20 Apr, 4:45 PM',
      status: 'completed',
      icon: ShoppingBag,
      description: 'Monthly plan renewal'
    },
    {
      id: 7,
      type: 'received',
      name: 'Sunil Mehta',
      amount: '₹500',
      date: '19 Apr, 3:15 PM',
      status: 'completed',
      icon: ArrowDownLeft,
      description: 'Debt repayment'
    },
  ];

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const isPositive = transaction.type === 'received';
  
  const getStatusBadge = () => {
    switch(transaction.status) {
      case 'completed':
        return <span className="badge badge-green">Completed</span>;
      case 'pending':
        return <span className="badge bg-yellow-500/20 text-yellow-500">Pending</span>;
      case 'failed':
        return <span className="badge bg-red-500/20 text-red-500">Failed</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="card-gradient rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isPositive ? 'bg-emerald/20 text-emerald' : 'bg-rupee/20 text-rupee'
          }`}>
            <transaction.icon className="w-6 h-6" />
          </div>
          
          <div>
            <p className="font-medium">{transaction.name}</p>
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">{transaction.date}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <p className={`font-medium ${isPositive ? 'text-emerald' : ''}`}>
            {isPositive ? '+' : '-'}{transaction.amount}
          </p>
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const [showSendDialog, setShowSendDialog] = useState(false);

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-medium text-xl">Recent Transactions</h2>
                <Button variant="outline" size="sm" className="border-white/10">
                  <Clock className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              
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
                
                <Button variant="outline" className="w-full justify-start border-white/10 hover:bg-white/5">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Pay Bills
                </Button>
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
