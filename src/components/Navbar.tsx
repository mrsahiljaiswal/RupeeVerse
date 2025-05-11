import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Home, Book, BarChart, MessageSquare, Menu, X, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { notificationService, Notification } from '@/services/notificationService';
import NotificationPopup from './NotificationPopup';

const NavItem = ({ 
  icon: Icon, 
  text, 
  active, 
  to 
}: { 
  icon: React.ElementType, 
  text: string, 
  active: boolean, 
  to: string 
}) => {
  return (
    <Link to={to} className={cn("nav-link", active && "active")}>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        <span>{text}</span>
      </div>
    </Link>
  );
};

const Navbar = () => {
  const isMobile = useIsMobile(); // Define isMobile using the custom hook
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState(null); // For popup modal
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false); // Notification popup state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Modal for payment requests
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false); // Modal for transaction details
  const [transactionId, setTransactionId] = useState(null); // Store transactionId locally
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth(); // Ensure `isAuthenticated` is destructured from `useAuth`
  const navigate = useNavigate();
  const location = useLocation();
  const [localUserData, setLocalUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:3000';

  // Set active page based on current location
  const activePage = location.pathname === '/' ? 'home' : 
                    location.pathname === '/transactions' ? 'transactions' :
                    location.pathname === '/finlearn' ? 'finlearn' :
                    location.pathname === '/rupee-ai' ? 'ai' : '';

  const navItems = [
    { icon: Home, text: "Home", id: "home", to: "/" },
    { icon: BarChart, text: "Transactions", id: "transactions", to: "/transactions" },
    { icon: Book, text: "FinLearn", id: "finlearn", to: "/finlearn" },
    { icon: MessageSquare, text: "Rupee AI", id: "ai", to: "/rupee-ai" },
  ];

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = localStorage.getItem('data.authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          setLocalUserData(JSON.parse(userData));
        } else {
          setLocalUserData(null);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setLocalUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, [isAuthenticated]); // Ensure `isAuthenticated` is defined

  const handleLogout = async () => {
    try {
      await logout();
      setLocalUserData(null);
      navigate('/auth');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    try {
      if (!isAuthenticated) return;
      
      const data = await notificationService.fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Poll notifications every 3 seconds when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === id ? { ...notification, seen: true } : notification
      )
    );
    toast({
      title: 'Notification Marked as Read',
      description: 'The notification has been marked as read.',
      variant: 'default',
    });
  };

  const handleAccept = async () => {
    if (!transactionId) return;

    try {
      const token = localStorage.getItem('data.authToken');
      if (!token) {
        console.error('Auth token is missing');
        return;
      }

      // Send accept request to the server
      await axios.post(`${API_BASE_URL}/api/requests/accept/${transactionId}`, { transactionId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: 'Payment Accepted',
        description: 'You have accepted the payment request.',
        variant: 'default',
      });

      // Update local notifications state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.transactionId === transactionId ? { ...notification, seen: true } : notification
        )
      );
    } catch (error) {
      console.error('Error accepting payment:', error);
      toast({
        title: 'Error',
        description: 'There was an error accepting the payment.',
        variant: 'destructive',
      });
    } finally {
      setIsPaymentModalOpen(false);
      setTransactionId(null);
    }
  };

  const handleReject = async () => {
    if (!transactionId) return;

    try {
      const token = localStorage.getItem('data.authToken');
      if (!token) {
        console.error('Auth token is missing');
        return;
      }

      // Send reject request to the server
      await axios.post(`${API_BASE_URL}/api/requests/reject/${transactionId}`, { transactionId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: 'Payment Rejected',
        description: 'You have rejected the payment request.',
        variant: 'default',
      });

      // Update local notifications state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.transactionId === transactionId ? { ...notification, seen: true } : notification
        )
      );
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: 'There was an error rejecting the payment.',
        variant: 'destructive',
      });
    } finally {
      setIsPaymentModalOpen(false);
      setTransactionId(null);
    }
  };

  const renderAuthButtons = () => {
    if (isLoading) {
      return null;
    }

    if (localUserData) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className="purple-gradient hover:animate-gradient-shift px-4 py-2 h-auto"
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{localUserData.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {localUserData.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button 
        className="purple-gradient hover:animate-gradient-shift" 
        onClick={() => navigate('/auth')}
      >
        Login
      </Button>
    );
  };

  const renderMobileAuthButtons = () => {
    if (isLoading) {
      return null;
    }

    if (localUserData) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 p-2">
            <User className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{localUserData.username}</span>
              <span className="text-xs text-muted-foreground">{localUserData.email}</span>
            </div>
          </div>
          <Button 
            className="purple-gradient w-full" 
            onClick={() => navigate('/profile')}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      );
    }

    return (
      <Button 
        className="purple-gradient w-full" 
        onClick={() => navigate('/auth')}
      >
        Login
      </Button>
    );
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setTransactionId(notification.transactionId); // Store transactionId locally
    if (notification.type === 'request_sent') {
      setIsPaymentModalOpen(true); // Open Accept/Reject modal
    } else {
      setIsTransactionModalOpen(true); // Open transaction details modal
    }
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification._id !== id));
    toast({
      title: 'Notification Dismissed',
      description: 'The notification has been dismissed.',
      variant: 'default',
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-primary font-poppins font-bold text-xl">RupeeVerse</div>
        </div>

        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            {isOpen && (
              <div className="fixed inset-0 top-[72px] bg-background z-40">
                <nav className="flex flex-col p-6 space-y-6">
                  {navItems.map((item) => (
                    <NavItem 
                      key={item.id}
                      icon={item.icon} 
                      text={item.text} 
                      active={activePage === item.id}
                      to={item.to}
                    />
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <NavItem 
                  key={item.id}
                  icon={item.icon} 
                  text={item.text} 
                  active={activePage === item.id}
                  to={item.to}
                />
              ))}
            </nav>

            {/* Notification Button */}
            {isAuthenticated && (
              <div className="relative">
                <Button
                  variant="outline"
                  className="relative"
                  onClick={() => setIsNotificationPopupOpen(true)}
                >
                  Notifications
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* Auth Buttons */}
            {renderAuthButtons()}
          </div>
        )}
      </div>

      {/* Notification Popup */}
      {isAuthenticated && (
        <NotificationPopup
          isOpen={isNotificationPopupOpen}
          onClose={() => setIsNotificationPopupOpen(false)}
          notifications={notifications}
          onNotificationUpdate={fetchNotifications}
        />
      )}

      {/* Accept/Reject Modal */}
      {isPaymentModalOpen && selectedNotification && (
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-md purple-gradient text-white">
            <DialogHeader>
              <DialogTitle>Payment Request</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-300">{selectedNotification.message}</p>
            <DialogFooter>
              <Button className="bg-green-500 text-white" onClick={handleAccept}>
                Accept
              </Button>
              <Button className="bg-red-500 text-white" onClick={handleReject}>
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Transaction Details Modal */}
      {isTransactionModalOpen && selectedNotification && (
        <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
          <DialogContent className="max-w-md purple-gradient text-white">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-300">{selectedNotification.message}</p>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
};

export default Navbar;
