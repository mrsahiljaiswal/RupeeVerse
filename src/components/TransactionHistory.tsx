import React from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { IndianRupee, ArrowUpRight, ArrowDownLeft, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

const TransactionHistory = () => {
  const { transactions, loading, error, refetch } = useTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Failed to load transactions</p>
        <button 
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20"
        >
          Retry
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(transactions.data).map((transaction) => (
        <div
          key={transaction.transactionId}
          className="card-gradient backdrop-blur-sm rounded-lg p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'credited' ? 'bg-emerald/20 text-emerald' : 'bg-red-500/20 text-red-500'
              }`}>
                {transaction.type === 'credited' ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {transaction.type === 'credited' ? 'Received from' : 'Sent to'}
                  </span>
                  <span className="text-muted-foreground">
                    {transaction.type === 'credited' ? transaction.sender : transaction.receiver}
                  </span>
                </div>
                {transaction.note && (
                  <p className="text-sm text-muted-foreground mt-1">{transaction.note}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(transaction.transactionDate), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {transaction.type === 'credited' ? transaction.sender : transaction.receiver}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-medium ${
                transaction.type === 'credited' ? 'text-emerald' : 'text-red-500'
              }`}>
                {transaction.type === 'credited' ? '+' : '-'}₹{transaction.amount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {transaction.status}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory; 