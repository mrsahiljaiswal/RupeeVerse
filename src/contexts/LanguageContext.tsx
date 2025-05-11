
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi' | 'kn';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const translate = async (text: string): Promise<string> => {
    if (language === 'en') return text;
    
    try {
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: language === 'hi' ? 'hi' : 'kn',
          format: 'text'
        }),
      });
      
      const data = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text if translation fails
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
