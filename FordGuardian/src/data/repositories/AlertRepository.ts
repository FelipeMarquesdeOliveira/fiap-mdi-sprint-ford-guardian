import { Alert } from '../../domain/entities/Alert';
import { storageService } from '../../infrastructure/storage';
import { STORAGE_KEYS } from '../../infrastructure/storage/StorageKeys';
import { MOCK_ALERTS } from '../mocks';

export const alertRepository = {
  async getAll(): Promise<Alert[]> {
    const alerts = await storageService.get<Alert[]>(STORAGE_KEYS.ALERTS);
    if (!alerts || alerts.length === 0) {
      await storageService.set(STORAGE_KEYS.ALERTS, MOCK_ALERTS);
      return MOCK_ALERTS;
    }
    return alerts;
  },

  async getByVehicleId(vehicleId: string): Promise<Alert[]> {
    const alerts = await this.getAll();
    return alerts.filter(a => a.vehicleId === vehicleId);
  },

  async getUnreadCount(): Promise<number> {
    const alerts = await this.getAll();
    return alerts.filter(a => !a.isRead && !a.isDismissed).length;
  },

  async markAsRead(id: string): Promise<void> {
    const alerts = await this.getAll();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index].isRead = true;
      await storageService.set(STORAGE_KEYS.ALERTS, alerts);
    }
  },

  async dismiss(id: string): Promise<void> {
    const alerts = await this.getAll();
    const index = alerts.findIndex(a => a.id === id);
    if (index !== -1) {
      alerts[index].isDismissed = true;
      await storageService.set(STORAGE_KEYS.ALERTS, alerts);
    }
  },
};