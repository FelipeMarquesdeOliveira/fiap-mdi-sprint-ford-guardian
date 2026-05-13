import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onboardingStorage } from '../../infrastructure/storage';
import { FORD_COLORS, SPACING } from '../../shared/theme';
import { ROUTES, ONBOARDING_PAGES, FORD_LOGO } from '../../shared/constants';
import { Button } from '../components';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const ONBOARDING_ICONS = ['car-sports', 'speedometer', 'bell-ring-outline'] as const;

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Page transition animation
  const pageAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Entrance animation
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entranceAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }).start();
  }, []);

  const animatePageChange = (nextPage: number) => {
    // Animate out
    Animated.parallel([
      Animated.timing(pageAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentPage(nextPage);
      slideAnim.setValue(30);
      // Animate in
      Animated.parallel([
        Animated.spring(pageAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = async () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      animatePageChange(currentPage + 1);
    } else {
      await onboardingStorage.setCompleted();
      navigation.replace(ROUTES.LOGIN);
    }
  };

  const handleSkip = async () => {
    await onboardingStorage.setCompleted();
    navigation.replace(ROUTES.LOGIN);
  };

  const page = ONBOARDING_PAGES[currentPage];

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.topSection,
        {
          opacity: entranceAnim,
          transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        },
      ]}>
        <Image source={FORD_LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.pageIndicator}>
          {ONBOARDING_PAGES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentPage && styles.dotActive]}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[
        styles.content,
        {
          opacity: pageAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name={ONBOARDING_ICONS[currentPage] as any}
            size={48}
            color={FORD_COLORS.WHITE}
          />
        </View>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </Animated.View>

      <Animated.View style={[
        styles.bottomSection,
        {
          opacity: entranceAnim,
          transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}>
        <Button
          title={currentPage === ONBOARDING_PAGES.length - 1 ? 'Começar' : 'Próximo'}
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.button}
        />
        {currentPage < ONBOARDING_PAGES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    padding: 28,
  },
  topSection: {
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 32,
    marginBottom: 24,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8D8D8',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    width: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: FORD_COLORS.FORD_DARK_BLUE,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    gap: 12,
    paddingBottom: 20,
  },
  button: {
    width: '100%',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    color: FORD_COLORS.DARK_GRAY,
    fontSize: 14,
    fontWeight: '500',
  },
});