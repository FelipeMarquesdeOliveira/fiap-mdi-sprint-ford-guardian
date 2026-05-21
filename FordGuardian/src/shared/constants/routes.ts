export const ROUTES = {
  SPLASH: 'Splash',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  REGISTER: 'Register',
  MAIN_TABS: 'MainTabs',
  HOME: 'Home',
  VEHICLE_DETAILS: 'VehicleDetails',
  ADD_VEHICLE: 'AddVehicle',
  ALERTS: 'Alerts',
  ALERT_DETAIL: 'AlertDetail',
  PROFILE: 'Profile',
  REQUEST_REVIEW: 'RequestReview',
  FIND_DEALER: 'FindDealer',
  DASHBOARD: 'Dashboard',
  CAR_CONNECTION: 'CarConnection',
} as const;

export const ONBOARDING_PAGES = [
  {
    id: '1',
    title: 'Bem-vindo ao Ford Guardian',
    description: 'Monitoramento inteligente para seu veículo Ford',
    icon: 'car',
  },
  {
    id: '2',
    title: 'Saúde do Veículo',
    description: 'Acompanhe o status de saúde do seu carro em tempo real',
    icon: 'speedometer',
  },
  {
    id: '3',
    title: 'Alertas Preditivos',
    description: 'Receba avisos antes que problemas ocorram',
    icon: 'notifications',
  },
] as const;

export const HEALTH_STATUS_LABELS = {
  normal: 'Normal',
  attention: 'Atenção',
  critical: 'Crítico',
} as const;

export const ALERT_SEVERITY_LABELS = {
  low: 'Baixa',
  moderate: 'Moderada',
  high: 'Alta',
  critical: 'Crítica',
} as const;