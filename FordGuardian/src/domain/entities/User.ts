export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notificationsEnabled: boolean;
  preferredDealerId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}