import { AttendanceRecord } from '../types';
import { apiFetch } from './apiClient';
import { dataStore } from './dataStore';

export const attendanceService = {
  async getAttendanceRecords(className?: string, sectionName?: string, date?: string): Promise<AttendanceRecord[]> {
    try {
      const data = await apiFetch<AttendanceRecord[]>('/attendance');
      if (Array.isArray(data) ) {
        dataStore.setCollection('attendanceRecords', data);
      }
    } catch {
      // Fallback to local store
    }
    let result = dataStore.getCollection<AttendanceRecord>('attendanceRecords');
    if (className) result = result.filter(r => r.class_name === className);
    if (sectionName) result = result.filter(r => r.section_name === sectionName);
    if (date) result = result.filter(r => r.date === date);
    return result;
  },

  async saveAttendance(records: AttendanceRecord[]): Promise<boolean> {
    const attendanceStore = dataStore.getCollection<AttendanceRecord>('attendanceRecords');
    records.forEach(rec => {
      const idx = attendanceStore.findIndex(a => a.student_id === rec.student_id && a.date === rec.date);
      if (idx !== -1) {
        attendanceStore[idx] = rec;
      } else {
        attendanceStore.push(rec);
      }
    });
    dataStore.setCollection('attendanceRecords', attendanceStore);
    return Promise.resolve(true);
  }
};

