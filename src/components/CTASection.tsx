
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  const scrollToBankingSection = () => {
    const section = document.querySelector('#offline-upi-section');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Gradients */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 opacity-30" 
        aria-hidden="true"
      />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-5xl mb-6 leading-tight">
            Experience Banking That Works
            <span className="text-primary block"> Without Internet</span>
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of rural users who are already enjoying secure, offline banking with RupeeVerse.
          </p>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="text-lg px-8 py-6 border-white/10 hover:bg-white/5"
              onClick={scrollToBankingSection}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
