import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { InventoryProvider } from '@/contexts/InventoryContext';
import LoginSuccessAnimation from '@/components/LoginSuccessAnimation';
import { useAuth } from '@/contexts/AuthContext';

function AppContent() {
  const { showLoginAnimation, hideLoginAnimation, user } = useAuth();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      
      {/* Login Success Animation */}
      <LoginSuccessAnimation
        visible={showLoginAnimation}
        onAnimationComplete={hideLoginAnimation}
        userName={user?.name || 'User'}
      />
    </>
  );
}

// Prevent splash screen from auto-hiding with proper error handling
(async () => {
  try {
    await SplashScreen.preventAutoHideAsync();
  } catch (error) {
    console.warn('Failed to prevent splash screen auto-hide:', error);
  }
})();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (fontsLoaded || fontError) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Failed to hide splash screen:', error);
        }
      }
    };

    hideSplashScreen();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <InventoryProvider>
          <OrderProvider>
            <AppContent />
          </OrderProvider>
        </InventoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 