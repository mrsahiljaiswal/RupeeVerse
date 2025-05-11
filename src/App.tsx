import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { OfflineTransactionProvider } from "./contexts/OfflineTransactionContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import FinLearn from "./pages/FinLearn";
import RupeeAI from "./pages/RupeeAI";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import '@/styles/notifications.css';

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
      <LanguageProvider>
        <OfflineTransactionProvider>
          <AuthProvider>
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
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </OfflineTransactionProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
