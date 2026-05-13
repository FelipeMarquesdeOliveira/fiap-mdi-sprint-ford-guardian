export type HealthStatus = 'normal' | 'attention' | 'critical';

export interface Vehicle {
  id: string;
  userId: string;
  vin: string;
  brand: 'Ford';
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  imageUrl?: string;
  healthStatus: HealthStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AddVehicleRequest {
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  vin?: string;
  imageUrl?: string;
}