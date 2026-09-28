import { dataStore } from './dataStore';

export interface SchoolSettings {
  school_name: string;
  address: string;
  phone: string;
  email: string;
  academic_year: string;
  academic_year_start: string;
  academic_year_end: string;
  display_density: 'Comfortable' | 'Compact';
}

const defaultSettings: SchoolSettings = {
  school_name: 'SchoolDesk Demo Academy',
  address: '123 Education Lane, Learning City',
  phone: '+1 (555) 019-8234',
  email: 'admin@schooldesk.demo',
  academic_year: '2026-2027',
  academic_year_start: '2026-06-01',
  academic_year_end: '2027-05-31',
  display_density: 'Comfortable'
};

export const settingsService = {
  getSettings(): SchoolSettings {
    const s = localStorage.getItem('schooldesk_settings');
    if (s) {
      try {
        return { ...defaultSettings, ...JSON.parse(s) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  },

  async saveSettings(settings: Partial<SchoolSettings>): Promise<SchoolSettings> {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem('schooldesk_settings', JSON.stringify(updated));
      return Promise.resolve(updated);
    } catch (e) {
      return Promise.reject(new Error('Failed to save settings to localStorage'));
    }
  },

  async resetDemoData(): Promise<void> {
    try {
      // Clear all datastore keys
      localStorage.removeItem('schooldesk_settings');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('school_')) {
          localStorage.removeItem(key);
        }
      });
      dataStore.reset(); // Reload mock data
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(new Error('Failed to reset data'));
    }
  }
};
