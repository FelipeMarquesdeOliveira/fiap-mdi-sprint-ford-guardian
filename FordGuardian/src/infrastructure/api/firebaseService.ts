// @ts-nocheck - Firebase is optional, not installed
import { Vehicle } from '../../domain/entities/Vehicle';
import { Alert } from '../../domain/entities/Alert';
import { Dealer } from '../../domain/entities/Dealer';
import { User } from '../../domain/entities/User';

const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

let db: any = null;
let initialized = false;

async function initFirebase() {
  if (initialized) return;
  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    initialized = true;
  } catch (error) {
    console.warn('Firebase not configured. Using local storage fallback.');
    initialized = true;
  }
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  dealerId: string;
  dealerName: string;
  serviceType: string;
  date: string;
  mileage: number;
  cost: number;
  description: string;
}

export const firebaseService = {
  async init() {
    await initFirebase();
  },

  async getVehicles(userId: string): Promise<Vehicle[]> {
    await this.init();
    if (!db) return [];
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'vehicles'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  },

  async saveVehicle(vehicle: Vehicle): Promise<string> {
    await this.init();
    if (!db) return vehicle.id;
    try {
      const { collection, addDoc, doc, updateDoc } = await import('firebase/firestore');
      if (vehicle.id.startsWith('temp_')) {
        const docRef = await addDoc(collection(db, 'vehicles'), vehicle);
        return docRef.id;
      } else {
        await updateDoc(doc(db, 'vehicles', vehicle.id), vehicle);
        return vehicle.id;
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      return vehicle.id;
    }
  },

  async getAlerts(vehicleId: string): Promise<Alert[]> {
    await this.init();
    if (!db) return [];
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'alerts'), where('vehicleId', '==', vehicleId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  async saveAlert(alert: Alert): Promise<string> {
    await this.init();
    if (!db) return alert.id;
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const docRef = await addDoc(collection(db, 'alerts'), alert);
      return docRef.id;
    } catch (error) {
      console.error('Error saving alert:', error);
      return alert.id;
    }
  },

  async getServiceHistory(vehicleId: string): Promise<ServiceRecord[]> {
    await this.init();
    if (!db) return [];
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const q = query(
        collection(db, 'serviceHistory'),
        where('vehicleId', '==', vehicleId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRecord));
    } catch (error) {
      console.error('Error fetching service history:', error);
      return [];
    }
  },

  async saveServiceRecord(record: ServiceRecord): Promise<string> {
    await this.init();
    if (!db) return record.id;
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const docRef = await addDoc(collection(db, 'serviceHistory'), record);
      return docRef.id;
    } catch (error) {
      console.error('Error saving service record:', error);
      return record.id;
    }
  },

  async getDealers(): Promise<Dealer[]> {
    await this.init();
    if (!db) return [];
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const snapshot = await getDocs(collection(db, 'dealers'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer));
    } catch (error) {
      console.error('Error fetching dealers:', error);
      return [];
    }
  },

  async saveUser(user: User): Promise<void> {
    await this.init();
    if (!db) return;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.id), user);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser(userId: string): Promise<User | null> {
    await this.init();
    if (!db) return null;
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const snapshot = await getDoc(doc(db, 'users', userId));
      return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as User) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },
};