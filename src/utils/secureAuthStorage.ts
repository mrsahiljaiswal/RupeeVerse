import { Buffer } from 'buffer/';

export interface UserData {
  userId: string;
  username: string;
  email: string;
  balance: number;
  upiId?: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface SecureAuthData {
  token: string;
  userData: UserData;
  timestamp: number;
  signature: string;
}

// Generate a unique signature for the auth data
const generateSignature = (data: Omit<SecureAuthData, 'signature'>): string => {
  const dataString = `${data.token}-${data.userData.userId}-${data.timestamp}`;
  return Buffer.from(dataString).toString('base64');
};

// Encrypt auth data
const encryptAuthData = (data: Omit<SecureAuthData, 'signature' | 'timestamp'>): string => {
  const secureData: SecureAuthData = {
    ...data,
    timestamp: Date.now(),
    signature: generateSignature({ ...data, timestamp: Date.now() })
  };
  
  const encrypted = Buffer.from(JSON.stringify(secureData)).toString('base64');
  return encrypted;
};

// Decrypt auth data
const decryptAuthData = (encrypted: string): SecureAuthData | null => {
  try {
    const decrypted = Buffer.from(encrypted, 'base64').toString();
    const data: SecureAuthData = JSON.parse(decrypted);
    
    // Verify signature
    const expectedSignature = generateSignature({
      token: data.token,
      userData: data.userData,
      timestamp: data.timestamp
    });
    
    if (data.signature !== expectedSignature) {
      console.error('Auth data signature verification failed');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to decrypt auth data:', error);
    return null;
  }
};

// Get stored auth data
export const getSecureAuthData = (): SecureAuthData | null => {
  try {
    const encrypted = localStorage.getItem('secureAuthData');
    if (!encrypted) return null;
    
    return decryptAuthData(encrypted);
  } catch (error) {
    console.error('Failed to get secure auth data:', error);
    return null;
  }
};

// Store auth data securely
export const setSecureAuthData = (token: string, userData?: UserData) => {
  try {
    // If we have existing data, merge it with new data
    const existingData = getSecureAuthData();
    const newUserData = userData || existingData?.userData;

    if (!newUserData) {
      console.error('No user data provided and no existing data found');
      return false;
    }

    const encrypted = encryptAuthData({ 
      token, 
      userData: newUserData 
    });
    
    localStorage.setItem('secureAuthData', encrypted);
    return true;
  } catch (error) {
    console.error('Failed to set secure auth data:', error);
    return false;
  }
};

// Update user data while preserving token
export const updateSecureUserData = (userData: Partial<UserData>) => {
  try {
    const existingData = getSecureAuthData();
    if (!existingData) {
      console.error('No existing auth data found');
      return false;
    }

    const updatedUserData = {
      ...existingData.userData,
      ...userData
    };

    return setSecureAuthData(existingData.token, updatedUserData);
  } catch (error) {
    console.error('Failed to update secure user data:', error);
    return false;
  }
};

// Remove stored auth data
export const removeSecureAuthData = () => {
  localStorage.removeItem('secureAuthData');
}; 