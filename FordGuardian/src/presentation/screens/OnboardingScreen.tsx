import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage } from '../../infrastructure/storage';
import { FORD_COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../shared/theme';
import { ROUTES, ONBOARDING_PAGES } from '../../shared/constants';
import { Button } from '../components';

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
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{currentPage + 1}</Text>
          </View>
        </View>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </View>

      <View style={styles.pagination}>
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

      <View style={styles.buttons}>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  iconText: {
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
    paddingHorizontal: SPACING.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FORD_COLORS.MEDIUM_GRAY,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: FORD_COLORS.FORD_BLUE,
  },
  buttons: {
    gap: SPACING.md,
  },
  button: {
    width: '100%',
  },
});