import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onboardingStorage, authStorage } from '../../infrastructure/storage';
import { FORD_COLORS } from '../../shared/theme';
import { ROUTES } from '../../shared/constants';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
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
      <View style={styles.logoContainer}>
        <View style={styles.fordLogo}>
          <View style={styles.fordBlue} />
          <View style={styles.fordLabel} />
        </View>
      </View>
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
  fordLogo: {
    width: 120,
    height: 120,
    backgroundColor: FORD_COLORS.WHITE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fordBlue: {
    width: 80,
    height: 80,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    borderRadius: 40,
  },
  fordLabel: {
    marginTop: 8,
    width: 60,
    height: 8,
    backgroundColor: FORD_COLORS.FORD_BLUE,
    borderRadius: 4,
  },
});