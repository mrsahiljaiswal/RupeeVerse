import React from 'react';
import { Wifi, Lock, BookOpen, MessageSquare, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type FeatureCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  variant: 'purple' | 'green';
  className?: string;
  index: number;
};

const FeatureCard = ({ icon: Icon, title, description, variant, className, index }: FeatureCardProps) => {
  return (
    <motion.div 
      className={cn(
        "card-gradient rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col",
        className
      )}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
        variant === 'purple' ? 'bg-rupee/20 text-rupee' : 'bg-emerald/20 text-emerald'
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-poppins font-medium text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: Wifi,
      title: 'Offline-First',
      description: 'Access core banking features even without internet connection, perfect for rural areas.',
      variant: 'purple' as const,
    },
    {
      icon: MapPin,
      title: 'Locate Bank & ATMs',
      description: 'Find the nearest bank or ATM using our map integration, perfect for rural areas.',
      variant: 'purple' as const,
    },
    {
      icon: BookOpen,
      title: 'FinLearn Education',
      description: 'Improve your financial literacy through our interactive learning modules.',
      variant: 'purple' as const,
    },
    {
      icon: MessageSquare,
      title: 'Rupee AI',
      description: 'Your personal finance assistant powered by AI, works offline with voice commands.',
      variant: 'green' as const,
    },
  ];

  return (
    <section className="py-16 md:py-24 container px-4 mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
          Banking <span className="text-primary">Without Boundaries</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          RupeeVerse brings financial services to everyone, regardless of internet connectivity or location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index} 
            icon={feature.icon} 
            title={feature.title} 
            description={feature.description} 
            variant={feature.variant}
            index={index}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
