import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import SendMoneyDialog from '@/components/SendMoneyDialog';

const HeroSection = () => {
  const { toast } = useToast();
  const [showSendDialog, setShowSendDialog] = useState(false);

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
              <span className="text-sm font-medium text-primary">Offline-First Banking</span>
            </div>
            
            <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
              Banking that works
              <span className="block text-primary">without internet</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 md:max-w-lg">
              Secure transactions, easy loan applications, and financial learning - all accessible offline for rural communities.
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
                      <p className="text-muted-foreground text-sm">Available offline</p>
                    </div>
                    <div className="badge badge-purple">Offline</div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="font-poppins font-bold text-3xl text-white">₹ * * * * *</h2>
                    <p className="text-muted-foreground text-sm">Last updated: Today, 4:30 PM</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 green-gradient hover:animate-gradient-shift"
                      onClick={() => setShowSendDialog(true)}
                    >
                      Send Money
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/5">
                      Request
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 card-gradient rounded-2xl w-40 h-28 p-4 flex items-center justify-center gap-3 rotate-6 animate-pulse-slow">
                <div className="w-8 h-8 rounded-full card-gradient flex items-center justify-center text-primary">Ai</div>
                <div>
                  <p className="text-sm font-medium">Rupee AI</p>
                  <p className="text-xs text-muted-foreground">Voice Assistant</p>
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
