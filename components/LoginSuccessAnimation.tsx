import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoginSuccessAnimationProps {
  visible: boolean;
  onAnimationComplete: () => void;
  userName?: string;
}

// Device detection and scaling
const isTablet = screenWidth >= 768;
const isSmallDevice = screenWidth < 350;
const scaleFactor = Math.min(screenWidth / 375, screenHeight / 812);
const isLowEndDevice = screenWidth < 350 || screenHeight < 600;

// Responsive configurations
const config = {
  duration: isLowEndDevice ? 3000 : 4000,
  logoSize: Math.max(200, Math.min(300, 250 * scaleFactor)),
  speedMultiplier: isLowEndDevice ? 1.2 : 1,
};

export default function LoginSuccessAnimation({
  visible,
  onAnimationComplete,
  userName = 'Student'
}: LoginSuccessAnimationProps) {
  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0);
  const logoY = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);
  
  // Sparkle animations around the logo
  const sparkle1Opacity = useSharedValue(0);
  const sparkle1Scale = useSharedValue(0);
  const sparkle2Opacity = useSharedValue(0);
  const sparkle2Scale = useSharedValue(0);
  const sparkle3Opacity = useSharedValue(0);
  const sparkle3Scale = useSharedValue(0);
  const sparkle4Opacity = useSharedValue(0);
  const sparkle4Scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset all values
      backgroundOpacity.value = 0;
      logoScale.value = 0;
      logoY.value = 0;
      textOpacity.value = 0;
      textScale.value = 0.8;
      
      // Reset sparkles
      sparkle1Opacity.value = 0;
      sparkle1Scale.value = 0;
      sparkle2Opacity.value = 0;
      sparkle2Scale.value = 0;
      sparkle3Opacity.value = 0;
      sparkle3Scale.value = 0;
      sparkle4Opacity.value = 0;
      sparkle4Scale.value = 0;

      // Start animation sequence
      const duration = config.duration / config.speedMultiplier;
      
      // Phase 1: Background fade in (0-500ms)
      backgroundOpacity.value = withTiming(1, { duration: 500 });
      
      // Phase 2: Logo entrance with bounce (500-1500ms)
      logoScale.value = withDelay(500, withSpring(1, {
        damping: 6,
        stiffness: 100,
        mass: 1,
      }));
      
      // Phase 3: Continuous bouncing animation for ClickEat logo
      logoY.value = withDelay(1500, withRepeat(
        withSequence(
          withSpring(-20 * scaleFactor, { damping: 8, stiffness: 200 }),
          withSpring(0, { damping: 8, stiffness: 200 })
        ),
        3, // Repeat 3 times
        false
      ));

      // Phase 4: Sparkle effects around logo (1000-2500ms)
      const sparkleDelay = 1000;
      
      // Sparkle 1 - Top right
      sparkle1Opacity.value = withDelay(sparkleDelay, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));
      sparkle1Scale.value = withDelay(sparkleDelay, withSequence(
        withSpring(1, { damping: 8, stiffness: 150 }),
        withTiming(0, { duration: 300 })
      ));
      
      // Sparkle 2 - Top left
      sparkle2Opacity.value = withDelay(sparkleDelay + 200, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));
      sparkle2Scale.value = withDelay(sparkleDelay + 200, withSequence(
        withSpring(1, { damping: 8, stiffness: 150 }),
        withTiming(0, { duration: 300 })
      ));
      
      // Sparkle 3 - Bottom left
      sparkle3Opacity.value = withDelay(sparkleDelay + 400, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));
      sparkle3Scale.value = withDelay(sparkleDelay + 400, withSequence(
        withSpring(1, { damping: 8, stiffness: 150 }),
        withTiming(0, { duration: 300 })
      ));
      
      // Sparkle 4 - Bottom right
      sparkle4Opacity.value = withDelay(sparkleDelay + 600, withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ));
      sparkle4Scale.value = withDelay(sparkleDelay + 600, withSequence(
        withSpring(1, { damping: 8, stiffness: 150 }),
        withTiming(0, { duration: 300 })
      ));

      // Phase 5: Text entrance (2000-2800ms)
      textOpacity.value = withDelay(2000, withTiming(1, { duration: 600 }));
      textScale.value = withDelay(2000, withSpring(1, {
        damping: 8,
        stiffness: 120,
      }));

      // Complete animation
      setTimeout(() => {
        runOnJS(onAnimationComplete)();
      }, duration);
    }
  }, [visible]);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoY.value }
    ],
  }));

  const textContainerStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ scale: textScale.value }],
  }));

  // Sparkle styles
  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1Opacity.value,
    transform: [{ scale: sparkle1Scale.value }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2Opacity.value,
    transform: [{ scale: sparkle2Scale.value }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3Opacity.value,
    transform: [{ scale: sparkle3Scale.value }],
  }));

  const sparkle4Style = useAnimatedStyle(() => ({
    opacity: sparkle4Opacity.value,
    transform: [{ scale: sparkle4Scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Background */}
      <Animated.View style={[styles.background, backgroundStyle]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* ClickEat Logo with bouncing animation */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <Image 
            source={require('@/assets/images/20250802_2207_image.png')} 
            style={[styles.logo, { width: config.logoSize, height: config.logoSize }]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Sparkles around the logo */}
        <Animated.View style={[styles.sparkle, styles.sparkle1, sparkle1Style]}>
          <Text style={[styles.sparkleText, { fontSize: 24 * scaleFactor }]}>✨</Text>
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle2, sparkle2Style]}>
          <Text style={[styles.sparkleText, { fontSize: 20 * scaleFactor }]}>⭐</Text>
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle3, sparkle3Style]}>
          <Text style={[styles.sparkleText, { fontSize: 22 * scaleFactor }]}>✨</Text>
        </Animated.View>
        <Animated.View style={[styles.sparkle, styles.sparkle4, sparkle4Style]}>
          <Text style={[styles.sparkleText, { fontSize: 18 * scaleFactor }]}>⭐</Text>
        </Animated.View>

        {/* Text content */}
        <Animated.View style={[styles.textContainer, textContainerStyle]}>
          <Text style={[styles.welcomeText, { fontSize: Math.max(24, 28 * scaleFactor) }]}>
            Welcome Back!
          </Text>
          <Text style={[styles.userText, { fontSize: Math.max(16, 20 * scaleFactor) }]}>
            {userName}
          </Text>
          <Text style={[styles.successText, { fontSize: Math.max(12, 14 * scaleFactor) }]}>
            Login Successful
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40 * scaleFactor,
  },
  logo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: screenHeight * 0.35,
    right: screenWidth * 0.25,
  },
  sparkle2: {
    top: screenHeight * 0.32,
    left: screenWidth * 0.2,
  },
  sparkle3: {
    bottom: screenHeight * 0.45,
    left: screenWidth * 0.15,
  },
  sparkle4: {
    bottom: screenHeight * 0.42,
    right: screenWidth * 0.2,
  },
  sparkleText: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  textContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  userText: {
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  successText: {
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});