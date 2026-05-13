import { User } from '../../domain/entities/User';

export const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Felipe Marques',
    email: 'felipe@example.com',
    phone: '(11) 99999-9999',
    createdAt: '2026-01-01T00:00:00Z',
    preferences: {
      notificationsEnabled: true,
    },
  },
];

export const MOCK_USER_CREDENTIALS = {
  email: 'felipe@example.com',
  password: '123456',
};