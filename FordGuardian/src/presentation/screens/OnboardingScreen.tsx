import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage } from '../../infrastructure/storage';
import { FORD_COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/theme';
import { ROUTES, ONBOARDING_PAGES } from '../../shared/constants';
import { Button, FordLogo } from '../components';

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = async () => {
    if (currentPage < ONBOARDING_PAGES.length - 1) {
      setCurrentPage(currentPage + 1);
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
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <FordLogo size={50} color={FORD_COLORS.FORD_BLUE} />
        </View>
        <View style={styles.pageIndicator}>
          {ONBOARDING_PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconNumber}>{currentPage + 1}</Text>
          </View>
        </View>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </View>

      <View style={styles.bottomSection}>
        <Button
          title={currentPage === ONBOARDING_PAGES.length - 1 ? 'Começar' : 'Próximo'}
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.button}
        />
        {currentPage < ONBOARDING_PAGES.length - 1 && (
          <Button
            title="Pular"
            onPress={handleSkip}
            variant="outline"
            size="medium"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FORD_COLORS.WHITE,
    padding: SPACING.lg,
  },
  topSection: {
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FORD_COLORS.MEDIUM_GRAY,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: FORD_COLORS.FORD_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconNumber: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.WHITE,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: FORD_COLORS.FORD_DARK_BLUE,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: FORD_COLORS.DARK_GRAY,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  button: {
    width: '100%',
  },
});