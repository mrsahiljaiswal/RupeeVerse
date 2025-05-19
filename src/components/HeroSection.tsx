import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import SendMoneyDialog from '@/components/SendMoneyDialog';
import { getSecureAuthData } from '@/utils/secureAuthStorage';

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

const HeroSection = () => {
  const { toast } = useToast();
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const secureData = getSecureAuthData();
      if (!secureData?.token) {
        console.log('No auth token found, showing masked balance'); // Debug log
        setBalance(null);
        setLoading(false);
        return;
      }

      console.log('Fetching balance...'); // Debug log
      const response = await fetch('http://localhost:3000/api/balance', {
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

  const scrollToUPISection = () => {
    const section = document.querySelector('#offline-upi-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTransactionsSection = () => {
    const section = document.querySelector('#transactions-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div 
        className="absolute top-20 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" 
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-32 -left-12 w-80 h-80 bg-accent/10 rounded-full blur-3xl" 
        aria-hidden="true"
      />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-sm font-medium text-primary">Hybrid-First Banking</span>
            </div>
            
            <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Banking that works
              <span className="block text-primary">without internet</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 md:max-w-lg">
              Secure transactions, find nearest bank and ATM, and financial learning - all accessible offline for rural communities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                className="purple-gradient text-lg px-8 py-6 hover:animate-gradient-shift"
                onClick={scrollToUPISection}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 border-white/10 hover:bg-white/5"
                onClick={scrollToTransactionsSection}
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="w-full max-w-md mx-auto">
              <div className="card-gradient rounded-3xl p-1 animate-float shadow-lg">
                <div className="bg-card rounded-3xl p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-poppins font-medium text-lg text-white">Your Balance</h3>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        {loading && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                    <div className="badge badge-purple">Active</div>
                  </div>
                  
                  <div className="mb-8">
                    {loading ? (
                      <div className="h-8 w-32 bg-white/5 animate-pulse rounded" />
                    ) : balance !== null ? (
                      <>
                        <h2 className="font-poppins font-bold text-3xl text-white">
                          ₹{balance.toLocaleString()}
                        </h2>
                        {lastUpdated && (
                          <p className="text-muted-foreground text-sm">
                            Last updated: {formatLastUpdated(lastUpdated)}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="font-poppins font-bold text-3xl text-white">₹ * * * * *</h2>
                        <p className="text-muted-foreground text-sm">Sign in to view balance</p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 green-gradient hover:animate-gradient-shift"
                      onClick={() => setShowSendDialog(true)}
                    >
                      Send Money
                    </Button>
                    
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 card-gradient rounded-2xl w-40 h-28 p-4 flex items-center justify-center gap-3 rotate-6 animate-pulse-slow">
                <div className="w-8 h-8 rounded-full card-gradient flex items-center justify-center text-primary">Ai</div>
                <div>
                  <p className="text-sm font-medium">Rupee AI</p>
                </div>
                <Link to="/rupee-ai">
                  <Button className="absolute top-0 right-0 p-1 text-xs">Try Now</Button>
                </Link>
              </div>
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

export default HeroSection;
