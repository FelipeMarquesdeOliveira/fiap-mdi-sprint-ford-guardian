import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage, authStorage } from '../../infrastructure/storage';
import { FORD_COLORS, SPACING, TYPOGRAPHY } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      checkAuthState();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const checkAuthState = async () => {
    const isOnboarded = await onboardingStorage.isCompleted();
    const hasToken = await authStorage.getToken();

    if (!isOnboarded) {
      navigation.replace(ROUTES.ONBOARDING);
    } else if (hasToken) {
      navigation.replace(ROUTES.MAIN_TABS);
    } else {
      navigation.replace(ROUTES.LOGIN);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="alpha-f-circle" size={80} color={FORD_COLORS.WHITE} />
        </View>
        <View style={styles.brandName}>
          <Text style={styles.brandText}>FORD</Text>
          <Text style={styles.brandSubtext}>GUARDIAN</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.tagline, { opacity: opacityAnim }]}>
        <View style={styles.taglineBar} />
        <Text style={styles.taglineText}>Proteção inteligente para seu veículo</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.FORD_DARK_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: FORD_COLORS.FORD_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 32,
    fontWeight: '700',
    color: FORD_COLORS.WHITE,
    letterSpacing: 8,
  },
  brandSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: FORD_COLORS.WHITE,
    letterSpacing: 6,
    opacity: 0.8,
    marginTop: 4,
  },
  tagline: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  taglineBar: {
    width: 40,
    height: 2,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    marginBottom: SPACING.md,
  },
  taglineText: {
    fontSize: 14,
    color: FORD_COLORS.WHITE,
    opacity: 0.6,
  },
});