import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage, authStorage } from '../../infrastructure/storage';
import { FORD_COLORS } from '../../shared/theme';
import { ROUTES, FORD_LOGO } from '../../shared/constants';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequenced animation: logo → line → tagline → footer
    Animated.sequence([
      // 1) Logo fades in and scales up
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2) Line draws from center
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      // 3) Tagline slides up and fades in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 4) Footer fades in
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      checkAuthState();
    }, 2800);

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
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <Image source={FORD_LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <Animated.View style={[styles.line, {
        width: lineWidth.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 40],
        }),
      }]} />

      <Animated.View style={{
        opacity: taglineOpacity,
        transform: [{ translateY: taglineTranslateY }],
      }}>
        <Text style={styles.guardianText}>GUARDIAN</Text>
        <Text style={styles.tagline}>Proteção inteligente para seu veículo</Text>
      </Animated.View>

      <Animated.Text style={[styles.footerText, { opacity: footerOpacity }]}>
        Ford x FIAP
      </Animated.Text>
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
  logo: {
    width: 140,
    height: 56,
  },
  line: {
    height: 2,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    marginVertical: 24,
  },
  guardianText: {
    fontSize: 16,
    fontWeight: '300',
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: FORD_COLORS.DARK_GRAY,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 11,
    color: FORD_COLORS.MEDIUM_GRAY,
    letterSpacing: 1,
  },
});