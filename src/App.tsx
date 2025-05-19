import 'leaflet/dist/leaflet.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { OfflineTransactionProvider } from "./contexts/OfflineTransactionContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import FinLearn from "./pages/FinLearn";
import RupeeAI from "./pages/RupeeAI";
import ATMLocator from "./pages/ATMLocator";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import '@/styles/notifications.css';
import HeroSection from './components/HeroSection';
import Chatbot from '@/components/Chatbot';
import { ChatProvider } from '@/context/ChatContext';

const queryClient = new QueryClient();

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <></>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OfflineTransactionProvider>
        <AuthProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/finlearn" element={<FinLearn />} />
                    <Route path="/rupee-ai" element={<RupeeAI />} />
                    <Route path="/atm-locator" element={<ATMLocator />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <div id="chatbot-container">
                  <Chatbot />
                </div>
              </div>
            </BrowserRouter>
          </ChatProvider>
        </AuthProvider>
      </OfflineTransactionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
