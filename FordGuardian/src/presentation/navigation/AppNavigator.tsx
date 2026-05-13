import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
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
} from '../screens';

import { ROUTES } from '../../shared/constants';
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
  RequestReview: { vehicleId: string };
  FindDealer: { vehicleId?: string };
  Profile: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const screenOptions = {
  headerStyle: {
    backgroundColor: FORD_COLORS.FORD_DARK_BLUE,
  },
  headerTintColor: FORD_COLORS.WHITE,
  headerTitleStyle: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  headerShadowVisible: false,
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: FORD_COLORS.FORD_BLUE,
        tabBarInactiveTintColor: FORD_COLORS.DARK_GRAY,
        tabBarStyle: {
          backgroundColor: FORD_COLORS.WHITE,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: FORD_COLORS.BLACK,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.fontSize.xs,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
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
          headerShown: false,
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
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name={ROUTES.SPLASH as keyof RootStackParamList}
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.ONBOARDING as keyof RootStackParamList}
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.LOGIN as keyof RootStackParamList}
          component={LoginScreen}
          options={{ title: 'Entrar' }}
        />
        <Stack.Screen
          name={ROUTES.REGISTER as keyof RootStackParamList}
          component={RegisterScreen}
          options={{ title: 'Cadastro' }}
        />
        <Stack.Screen
          name={ROUTES.MAIN_TABS as keyof RootStackParamList}
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.VEHICLE_DETAILS as keyof RootStackParamList}
          component={VehicleDetailsScreen}
          options={({ route }) => ({
            title: 'Detalhes',
            headerBackTitle: 'Voltar',
          })}
        />
        <Stack.Screen
          name={ROUTES.ADD_VEHICLE as keyof RootStackParamList}
          component={AddVehicleScreen}
          options={{ title: 'Adicionar Veículo', headerBackTitle: 'Voltar' }}
        />
        <Stack.Screen
          name={ROUTES.ALERT_DETAIL as keyof RootStackParamList}
          component={AlertsScreen}
          options={{ title: 'Detalhes do Alerta', headerBackTitle: 'Voltar' }}
        />
        <Stack.Screen
          name={ROUTES.REQUEST_REVIEW as keyof RootStackParamList}
          component={RequestReviewScreen}
          options={{ title: 'Solicitar Revisão', headerBackTitle: 'Voltar' }}
        />
        <Stack.Screen
          name={ROUTES.FIND_DEALER as keyof RootStackParamList}
          component={FindDealerScreen}
          options={{ title: 'Concessionárias', headerBackTitle: 'Voltar' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};