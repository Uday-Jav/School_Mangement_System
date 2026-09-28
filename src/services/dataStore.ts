import * as mockData from '../data/mockData';

const STORE_KEY = 'schooldesk_data_v1';

class DataStore {
  public data: any = {};

  constructor() {
    this.init();
  }

  public init() {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
        this.migrate();
      } else {
        this.reset();
      }
    } catch {
      this.reset();
    }
  }

  private migrate() {
    // Basic migration logic in case we added new collections to mockData 
    // that don't exist in local storage yet.
    let updated = false;
    for (const key of Object.keys(mockData)) {
      if (key.startsWith('mock')) {
        const collName = key.replace('mock', '');
        const camelKey = collName.charAt(0).toLowerCase() + collName.slice(1);
        if (!this.data[camelKey]) {
          this.data[camelKey] = [...(mockData as any)[key]];
          updated = true;
        }
      }
    }
    if (updated) this.save();
  }

  public save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  public reset() {
    this.data = {};
    for (const key of Object.keys(mockData)) {
      if (key.startsWith('mock')) {
        const collName = key.replace('mock', '');
        const camelKey = collName.charAt(0).toLowerCase() + collName.slice(1);
        this.data[camelKey] = [...(mockData as any)[key]];
      }
    }
    this.save();
  }

  public getCollection<T>(key: string): T[] {
    return [];
  }

  public setCollection<T>(key: string, items: T[]) {
    this.data[key] = items;
    this.save();
  }
}

export const dataStore = new DataStore();
