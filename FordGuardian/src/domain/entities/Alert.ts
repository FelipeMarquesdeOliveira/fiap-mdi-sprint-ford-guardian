export type AlertType =
  | 'oil_change'
  | 'preventive_review'
  | 'engine_failure_risk'
  | 'brake_inspection'
  | 'tire_rotation';

export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface Alert {
  id: string;
  vehicleId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendedAction: string;
  createdAt: string;
  isRead: boolean;
  isDismissed: boolean;
}