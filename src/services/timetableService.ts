import { TimetablePeriod } from '../types';
import { dataStore } from './dataStore';

export const timetableService = {
  async getTimetable(classId?: string, sectionId?: string, teacherName?: string): Promise<TimetablePeriod[]> {
    let result = dataStore.getCollection<TimetablePeriod>('timetable');
    if (classId) result = result.filter(t => t.class_id === classId);
    if (sectionId) result = result.filter(t => t.section_id === sectionId);
    if (teacherName) result = result.filter(t => t.teacher_name === teacherName);
    return Promise.resolve(result);
  },

  async addPeriod(periodData: Omit<TimetablePeriod, 'id'>): Promise<TimetablePeriod> {
    const timetableStore = dataStore.getCollection<TimetablePeriod>('timetable');
    const newPeriod: TimetablePeriod = {
      ...periodData,
      id: `tt-${Date.now()}`
    };
    dataStore.setCollection('timetable', [...timetableStore, newPeriod]);
    return Promise.resolve(newPeriod);
  },

  async updatePeriod(id: string, updates: Partial<TimetablePeriod>): Promise<TimetablePeriod> {
    const timetableStore = dataStore.getCollection<TimetablePeriod>('timetable');
    const idx = timetableStore.findIndex(t => t.id === id);
    if (idx !== -1) {
      timetableStore[idx] = { ...timetableStore[idx], ...updates };
      dataStore.setCollection('timetable', timetableStore);
      return Promise.resolve(timetableStore[idx]);
    }
    throw new Error('Period not found');
  },

  async deletePeriod(id: string): Promise<boolean> {
    const timetableStore = dataStore.getCollection<TimetablePeriod>('timetable');
    dataStore.setCollection('timetable', timetableStore.filter(t => t.id !== id));
    return Promise.resolve(true);
  }
};
