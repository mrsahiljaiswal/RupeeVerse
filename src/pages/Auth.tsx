import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { setSecureAuthData } from '@/utils/secureAuthStorage';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = React.useState(false);

  // Shared states
  const [password, setPassword] = React.useState('');

  // Login states
  const [loginUsername, setLoginUsername] = React.useState('');

  // Register states
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [registerUsername, setRegisterUsername] = React.useState('');

  const API_BASE_URL = 'https://upiconnect.onrender.com/api/auth';

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/current-user`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.status === 200) {
        const userData = response.data.data;
        // Store user data securely
        setSecureAuthData(authToken, userData);
        return userData;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const handleAuth = async (isSignUp: boolean) => {
    try {
      setLoading(true);
      const endpoint = isSignUp ? `${API_BASE_URL}/signup` : `${API_BASE_URL}/login`;

      const requestBody = isSignUp
        ? {
            email,
            phone,
            username: registerUsername,
            password,
          }
        : {
            username: loginUsername,
            password,
          };

      const response = await axios.post(endpoint, requestBody);

      if (response.status === 200 || response.status === 201) {
        if (response.data.data?.authToken) {
          const authToken = response.data.data.authToken;
          
          // Login through context
          login(authToken);

          // Fetch user profile after successful login
          if (!isSignUp) {
            try {
              await fetchUserProfile(authToken);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }
        }

        toast({
          variant: "default",
          title: isSignUp ? 'Account created!' : 'Welcome back!',
          description: isSignUp
            ? 'You can now log in with your new account.'
            : 'You have been successfully logged in.',
        });

        if (!isSignUp) {
          setTimeout(() => {
            navigate('/');
          }, 1000);
        }
      } else {
        toast({
          variant: "destructive",
          title: 'Error',
          description: response.data.message || 'Authentication failed.',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to RupeeVerse</h2>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account to continue
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN FORM */}
          <TabsContent value="login" className="space-y-4">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                className="w-full"
                onClick={() => handleAuth(false)}
                disabled={loading}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </div>
          </TabsContent>

          {/* REGISTER FORM */}
          <TabsContent value="register" className="space-y-4">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              <Input
                type="text"
                placeholder="Username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <Button
                className="w-full"
                onClick={() => handleAuth(true)}
                disabled={loading}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
