import { Subject } from '../types';
import { dataStore } from './dataStore';

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    return Promise.resolve(dataStore.getCollection<Subject>('subjects'));
  },

  async createSubject(subData: Omit<Subject, 'id'>): Promise<Subject> {
    const subjectsStore = dataStore.getCollection<Subject>('subjects');
    const id = `sub-${Date.now()}`;
    const newSubject: Subject = { ...subData, id };
    subjectsStore.push(newSubject);
    dataStore.setCollection('subjects', subjectsStore);
    return Promise.resolve(newSubject);
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const subjectsStore = dataStore.getCollection<Subject>('subjects');
    const index = subjectsStore.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subject not found');
    subjectsStore[index] = { ...subjectsStore[index], ...updates };
    dataStore.setCollection('subjects', subjectsStore);
    return Promise.resolve({ ...subjectsStore[index] });
  },

  async deleteSubject(id: string): Promise<boolean> {
    let subjectsStore = dataStore.getCollection<Subject>('subjects');
    subjectsStore = subjectsStore.filter(s => s.id !== id);
    dataStore.setCollection('subjects', subjectsStore);
    return Promise.resolve(true);
  }
};

