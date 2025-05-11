import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSecureAuthData } from '@/utils/secureAuthStorage';
import { UserData } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Wallet } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = async () => {
    try {
      const secureData = await getSecureAuthData();
      if (!secureData?.token) return;

      const response = await axios.get('https://upiconnect.onrender.com/api/auth/current-user', {
        headers: {
          Authorization: `Bearer ${secureData.token}`
        }
      });

      if (response.data.status === 'success') {
        const userData: UserData = {
          username: response.data.data.username,
          email: response.data.data.email,
          finalBalance: response.data.data.finalBalance
        };
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData(); // Initial fetch
    const interval = setInterval(fetchUserData, 3000); // Fetch every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userData.username}</h2>
              <p className="text-muted-foreground">{userData.email}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="font-medium">₹{userData.finalBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/transactions')}
            >
              View Transactions
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 