import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage, authStorage } from '../../infrastructure/storage';
import { FORD_COLORS, SPACING } from '../../shared/theme';
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
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.logoWrap}>
          <MaterialCommunityIcons name="alpha-f-box" size={72} color={FORD_COLORS.FORD_BLUE} />
        </View>
        <View style={styles.brandRow}>
          <View style={styles.fordTag}>
            <Text style={styles.fordTagText}>FORD</Text>
          </View>
          <Text style={styles.guardianText}>GUARDIAN</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Proteção inteligente para seu veículo</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoWrap: {
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fordTag: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 12,
  },
  fordTagText: {
    color: FORD_COLORS.WHITE,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  guardianText: {
    fontSize: 16,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: 2,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
    letterSpacing: 0.3,
  },
});