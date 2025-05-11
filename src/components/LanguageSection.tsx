
import React from 'react';
import { Globe, Languages, IndianRupee } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

type LanguageCardProps = {
  language: string;
  text: string;
  className?: string;
}

const LanguageCard = ({ language, text, className }: LanguageCardProps) => {
  return (
    <Card className={cn("card-gradient border-none overflow-hidden", className)}>
      <CardContent className="p-4">
        <h4 className="font-poppins font-medium text-sm mb-2 flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          {language}
        </h4>
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
};

const LanguageSection = () => {
  const languageTexts = [
    {
      language: "English",
      text: "Banking without boundaries, even when offline."
    },
    {
      language: "हिंदी (Hindi)",
      text: "ऑफ़लाइन होने पर भी बिना सीमाओं के बैंकिंग।"
    },
    {
      language: "ಕನ್ನಡ (Kannada)",
      text: "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದಾಗಲೂ ಗಡಿಗಳಿಲ್ಲದ ಬ್ಯಾಂಕಿಂಗ್."
    },
    {
      language: "বাংলা (Bengali)",
      text: "অফলাইন থাকলেও সীমাহীন ব্যাঙ্কিং।"
    }
  ];

  return (
    <section className="py-16 md:py-20 container px-4 mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
          <Languages className="h-4 w-4" />
          <span className="text-sm font-medium">Multiple Languages</span>
        </div>
        <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4">
          Banking in <span className="text-primary">Your Language</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          RupeeVerse supports multiple regional languages, making financial services accessible to everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {languageTexts.map((item, index) => (
          <LanguageCard
            key={index}
            language={item.language}
            text={item.text}
          />
        ))}
      </div>

      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span className="text-sm">More languages coming soon</span>
        </div>
      </div>
    </section>
  );
};

export default LanguageSection;
