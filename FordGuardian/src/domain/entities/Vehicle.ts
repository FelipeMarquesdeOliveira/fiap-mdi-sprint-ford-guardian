export type HealthStatus = 'normal' | 'attention' | 'critical';

export interface FipeDetails {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  referencia: string;
}

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
  fipeDetails?: FipeDetails;
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
  fipeDetails?: FipeDetails;
}