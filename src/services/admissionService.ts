import { AdmissionApplication } from '../types';
import { dataStore } from './dataStore';

export const admissionService = {
  async getApplications(): Promise<AdmissionApplication[]> {
    return Promise.resolve(dataStore.getCollection<AdmissionApplication>('applications'));
  },

  async saveApplication(app: Omit<AdmissionApplication, 'id'>): Promise<AdmissionApplication> {
    const apps = dataStore.getCollection<AdmissionApplication>('applications');
    const newApp: AdmissionApplication = { ...app, id: `app-${Date.now()}` };
    dataStore.setCollection('applications', [newApp, ...apps]);
    return Promise.resolve(newApp);
  },

  async updateApplicationStatus(id: string, status: AdmissionApplication['status']): Promise<AdmissionApplication> {
    const apps = dataStore.getCollection<AdmissionApplication>('applications');
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index] = { ...apps[index], status };
      dataStore.setCollection('applications', apps);
      return Promise.resolve(apps[index]);
    }
    throw new Error('Application not found');
  },

  async updateApplication(id: string, updates: Partial<AdmissionApplication>): Promise<AdmissionApplication> {
    const apps = dataStore.getCollection<AdmissionApplication>('applications');
    const index = apps.findIndex(a => a.id === id);
    if (index !== -1) {
      apps[index] = { ...apps[index], ...updates };
      dataStore.setCollection('applications', apps);
      return Promise.resolve(apps[index]);
    }
    throw new Error('Application not found');
  }
};
