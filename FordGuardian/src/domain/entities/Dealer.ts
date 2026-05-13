export interface Dealer {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  distance?: number;
  rating?: number;
  services: string[];
}

export type ServiceType =
  | 'oil_change'
  | 'brake_inspection'
  | 'tire_rotation'
  | 'general_review'
  | 'other';

export interface RequestReviewRequest {
  vehicleId: string;
  dealerId: string;
  preferredDate: string;
  serviceType: ServiceType;
}