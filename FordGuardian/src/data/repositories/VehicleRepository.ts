import { Vehicle, AddVehicleRequest } from '../../domain/entities/Vehicle';
import { storageService } from '../../infrastructure/storage';
import { STORAGE_KEYS } from '../../infrastructure/storage/StorageKeys';
import { MOCK_VEHICLES } from '../mocks';

// Version key to force mock data refresh when we update mock data
const MOCK_DATA_VERSION = 'v2';
const MOCK_VERSION_KEY = '@ford_guardian_mock_version';

export const vehicleRepository = {
  async getAll(): Promise<Vehicle[]> {
    // Check if mock data version changed — if so, reset to new mocks
    const currentVersion = await storageService.get<string>(MOCK_VERSION_KEY);
    if (currentVersion !== MOCK_DATA_VERSION) {
      await storageService.set(STORAGE_KEYS.VEHICLES, MOCK_VEHICLES);
      await storageService.set(MOCK_VERSION_KEY, MOCK_DATA_VERSION);
      return MOCK_VEHICLES;
    }

    const vehicles = await storageService.get<Vehicle[]>(STORAGE_KEYS.VEHICLES);
    if (!vehicles || vehicles.length === 0) {
      await storageService.set(STORAGE_KEYS.VEHICLES, MOCK_VEHICLES);
      return MOCK_VEHICLES;
    }
    return vehicles;
  },

  async getById(id: string): Promise<Vehicle | null> {
    const vehicles = await this.getAll();
    return vehicles.find(v => v.id === id) || null;
  },

  async add(request: AddVehicleRequest): Promise<Vehicle> {
    const vehicles = await this.getAll();
    const newVehicle: Vehicle = {
      id: Date.now().toString(),
      userId: 'user_1',
      vin: request.vin || `MOCK${Date.now()}`,
      brand: 'Ford',
      model: request.model,
      year: request.year,
      licensePlate: request.licensePlate,
      mileage: request.mileage,
      imageUrl: request.imageUrl,
      healthStatus: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vehicles.push(newVehicle);
    await storageService.set(STORAGE_KEYS.VEHICLES, vehicles);
    return newVehicle;
  },

  async updateHealthStatus(id: string, status: Vehicle['healthStatus']): Promise<void> {
    const vehicles = await this.getAll();
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles[index].healthStatus = status;
      vehicles[index].updatedAt = new Date().toISOString();
      await storageService.set(STORAGE_KEYS.VEHICLES, vehicles);
    }
  },

  async delete(id: string): Promise<void> {
    const vehicles = await this.getAll();
    const filtered = vehicles.filter(v => v.id !== id);
    await storageService.set(STORAGE_KEYS.VEHICLES, filtered);
  },
};