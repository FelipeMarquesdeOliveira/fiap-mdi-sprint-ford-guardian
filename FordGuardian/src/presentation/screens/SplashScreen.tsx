import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage, authStorage } from '../../infrastructure/storage';
import { FORD_COLORS, SPACING } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';
import { FordLogo } from '../components';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

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

    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    await new Promise(resolve => setTimeout(resolve, 2500));
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
          <FordLogo size={80} color={FORD_COLORS.WHITE} />
        </View>
        <View style={styles.brandName}>
          <Animated.Text style={[styles.brandText, { opacity: opacityAnim }]}>
            FORD
          </Animated.Text>
          <Animated.Text style={[styles.brandSubtext, { opacity: opacityAnim }]}>
            GUARDIAN
          </Animated.Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.tagline, { opacity: opacityAnim }]}>
        <View style={styles.taglineBar} />
        <Animated.Text style={styles.taglineText}>
         Proteção inteligente para seu veículo
        </Animated.Text>
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