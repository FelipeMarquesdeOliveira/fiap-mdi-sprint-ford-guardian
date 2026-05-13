import { User, LoginRequest, RegisterRequest } from '../../domain/entities/User';
import { storageService, authStorage } from '../../infrastructure/storage';
import { STORAGE_KEYS } from '../../infrastructure/storage/StorageKeys';
import { MOCK_USERS, MOCK_USER_CREDENTIALS } from '../mocks';

export const userRepository = {
  async login(request: LoginRequest): Promise<User> {
    if (request.email === MOCK_USER_CREDENTIALS.email && request.password === MOCK_USER_CREDENTIALS.password) {
      const user = MOCK_USERS[0];
      await storageService.set(STORAGE_KEYS.CURRENT_USER, user);
      await authStorage.setToken('mock_jwt_token_' + Date.now());
      return user;
    }
    throw new Error('Email ou senha incorretos');
  },

  async register(request: RegisterRequest): Promise<User> {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: request.name,
      email: request.email,
      phone: request.phone,
      createdAt: new Date().toISOString(),
      preferences: {
        notificationsEnabled: true,
      },
    };
    await storageService.set(STORAGE_KEYS.CURRENT_USER, newUser);
    await authStorage.setToken('mock_jwt_token_' + Date.now());
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    return storageService.get<User>(STORAGE_KEYS.CURRENT_USER);
  },

  async logout(): Promise<void> {
    await storageService.remove(STORAGE_KEYS.CURRENT_USER);
    await authStorage.clearToken();
  },
};