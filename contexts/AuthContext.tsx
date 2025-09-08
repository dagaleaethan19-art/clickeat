import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  showLoginAnimation: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (userData: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hideLoginAnimation: () => void;
}

interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'buyer' | 'seller';
  profileImage?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: '@rshs_canteen_user',
  TOKEN: '@rshs_canteen_token',
};

// Mock users database (in production, this would be a real API)
const mockUsers: User[] = [
  {
    id: 'buyer1',
    name: 'Juan Dela Cruz',
    email: 'juan@student.rshs.edu.ph',
    phone: '+639123456789',
    role: 'buyer',
    profileImage: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'seller1',
    name: 'Tita Rosa',
    email: 'rosa@seller.rshs.edu.ph',
    phone: '+639987654321',
    role: 'seller',
    profileImage: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: 'student1',
    name: 'Maria Santos',
    email: 'maria@student.rshs.edu.ph',
    phone: '+639111222333',
    role: 'buyer',
    profileImage: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock database
      const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        return { success: false, error: 'No account found with this email address' };
      }
      
      // In production, you would verify the password hash
      // For demo purposes, we'll accept any password for existing users
      if (password.length < 6) {
        return { success: false, error: 'Invalid password' };
      }
      
      // Generate mock token
      const token = `token_${foundUser.id}_${Date.now()}`;
      
      // Store user and token
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      setUser(foundUser);
      setShowLoginAnimation(true);
      return { success: true };
      
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        profileImage: userData.profileImage || (userData.role === 'seller' 
          ? 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150'
          : 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150')
      };
      
      // Add to mock database
      mockUsers.push(newUser);
      
      // Generate token
      const token = `token_${newUser.id}_${Date.now()}`;
      
      // Store user and token
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      setUser(newUser);
      setShowLoginAnimation(true);
      return { success: true };
      
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An error occurred during sign up' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored data
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOKEN]);
      
      setUser(null);
      
      // Redirect to sign-in page after successful sign out
      router.replace('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  const hideLoginAnimation = () => {
    setShowLoginAnimation(false);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    showLoginAnimation,
    signIn,
    signUp,
    signOut,
    updateUser,
    hideLoginAnimation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}