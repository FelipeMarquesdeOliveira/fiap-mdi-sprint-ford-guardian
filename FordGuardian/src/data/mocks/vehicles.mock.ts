import { Vehicle } from '../../domain/entities/Vehicle';

// Ford vehicle image mapping - using reliable direct URLs
export const FORD_VEHICLE_IMAGES: Record<string, string> = {
  'Mustang GT': 'https://cdn.motor1.com/images/mgl/6Zozlp/s3/ford-mustang-gt-2024.jpg',
  'F-150 XLT': 'https://cdn.motor1.com/images/mgl/MkO9NN/s3/ford-f-150-2024.jpg',
  'Bronco Sport': 'https://cdn.motor1.com/images/mgl/W81Ypq/s3/ford-bronco-sport-2024.jpg',
  'Ranger': 'https://cdn.motor1.com/images/mgl/QJl06/s3/ford-ranger-2023.jpg',
  'Territory': 'https://cdn.motor1.com/images/mgl/nAGPBl/s3/ford-territory-2024.jpg',
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    userId: 'user_1',
    vin: '1FA6P8CF5L5100001',
    brand: 'Ford',
    model: 'Mustang GT',
    year: 2024,
    licensePlate: 'FRD-1A23',
    mileage: 12500,
    healthStatus: 'normal',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-05-10T14:20:00Z',
  },
  {
    id: '2',
    userId: 'user_1',
    vin: '1FTFW1E80NFA00002',
    brand: 'Ford',
    model: 'Bronco Sport',
    year: 2024,
    licensePlate: 'FRD-2B45',
    mileage: 31000,
    healthStatus: 'attention',
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2026-05-12T09:15:00Z',
  },
  {
    id: '3',
    userId: 'user_1',
    vin: '1FTER4FH5LLA00003',
    brand: 'Ford',
    model: 'Ranger',
    year: 2023,
    licensePlate: 'FRD-3C67',
    mileage: 58000,
    healthStatus: 'critical',
    createdAt: '2025-06-10T16:45:00Z',
    updatedAt: '2026-05-11T18:30:00Z',
  },
];