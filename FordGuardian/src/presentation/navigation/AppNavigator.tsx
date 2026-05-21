import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
  HomeScreen,
  VehicleDetailsScreen,
  AddVehicleScreen,
  AlertsScreen,
  RequestReviewScreen,
  FindDealerScreen,
  ProfileScreen,
  DashboardScreen,
  CarConnectionScreen,
} from '../screens';

import { ROUTES, FORD_LOGO } from '../../shared/constants';
import { FORD_COLORS, TYPOGRAPHY } from '../../shared/theme';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Home: undefined;
  VehicleDetails: { vehicleId: string };
  AddVehicle: undefined;
  Alerts: undefined;
  AlertDetail: { alertId: string };
  RequestReview: { vehicleId?: string; dealerId?: string; dealerName?: string };
  FindDealer: { vehicleId?: string };
  Profile: undefined;
  Dashboard: undefined;
  CarConnection: { vehicleId: string };
};

export type MainTabsParamList = {
  Home: undefined;
  Alerts: undefined;
  Dashboard: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Ford-branded header with logo
const FordHeaderTitle = () => (
  <Image source={FORD_LOGO} style={{ width: 72, height: 28 }} resizeMode="contain" />
);

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: FORD_COLORS.WHITE,
  },
  headerTintColor: FORD_COLORS.FORD_BLUE,
  headerTitleStyle: {
    fontWeight: '600' as const,
    fontSize: 16,
    color: FORD_COLORS.FORD_DARK_BLUE,
    letterSpacing: 0.3,
  },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
  // Screen transition animations
  animation: 'slide_from_right' as const,
  animationDuration: 250,
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: FORD_COLORS.WHITE,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: FORD_COLORS.FORD_BLUE,
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 24 : 14,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.3,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME as keyof MainTabsParamList}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Veículos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="car-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.ALERTS as keyof MainTabsParamList}
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.DASHBOARD as keyof MainTabsParamList}
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE as keyof MainTabsParamList}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        <Stack.Screen
          name={ROUTES.SPLASH as keyof RootStackParamList}
          component={SplashScreen}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name={ROUTES.ONBOARDING as keyof RootStackParamList}
          component={OnboardingScreen}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name={ROUTES.LOGIN as keyof RootStackParamList}
          component={LoginScreen}
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name={ROUTES.REGISTER as keyof RootStackParamList}
          component={RegisterScreen}
          options={{
            title: 'Cadastro',
            headerTitle: FordHeaderTitle,
          }}
        />
        <Stack.Screen
          name={ROUTES.MAIN_TABS as keyof RootStackParamList}
          component={MainTabs}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name={ROUTES.VEHICLE_DETAILS as keyof RootStackParamList}
          component={VehicleDetailsScreen}
          options={{
            headerTitle: FordHeaderTitle,
          }}
        />
        <Stack.Screen
          name={ROUTES.ADD_VEHICLE as keyof RootStackParamList}
          component={AddVehicleScreen}
          options={{
            headerTitle: FordHeaderTitle,
          }}
        />
        <Stack.Screen
          name={ROUTES.ALERT_DETAIL as keyof RootStackParamList}
          component={AlertsScreen}
          options={{
            headerTitle: FordHeaderTitle,
          }}
        />
        <Stack.Screen
          name={ROUTES.REQUEST_REVIEW as keyof RootStackParamList}
          component={RequestReviewScreen}
          options={{
            headerTitle: FordHeaderTitle,
          }}
        />
        <Stack.Screen
          name={ROUTES.FIND_DEALER as keyof RootStackParamList}
          component={FindDealerScreen}
          options={{
            headerTitle: FordHeaderTitle,
          }}
        />
        <Stack.Screen
          name={ROUTES.DASHBOARD as keyof RootStackParamList}
          component={DashboardScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={ROUTES.CAR_CONNECTION as keyof RootStackParamList}
          component={CarConnectionScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};