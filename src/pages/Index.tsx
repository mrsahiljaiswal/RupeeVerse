
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import LanguageSection from '@/components/LanguageSection';
import TransactionsSection from '@/components/TransactionsSection';
import OfflineUPISection from '@/components/OfflineUPISection';
import FinLearnSection from '@/components/FinLearnSection';
import RupeeAISection from '@/components/RupeeAISection';
import TeamSection from '@/components/TeamSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LanguageSection />
        <TransactionsSection />
        <OfflineUPISection />
        <FinLearnSection />
        <RupeeAISection />
        <TeamSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
