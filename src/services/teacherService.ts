import { Teacher } from '../types';
import { apiFetch } from './apiClient';
import { dataStore } from './dataStore';

export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    try {
      const data = await apiFetch<Teacher[]>('/teachers');
      if (Array.isArray(data) ) {
        dataStore.setCollection('teachers', data);
        return data;
      }
      return dataStore.getCollection<Teacher>('teachers');
    } catch (err) {
      console.warn('Backend API unreachable, using local store:', err);
      return dataStore.getCollection<Teacher>('teachers');
    }
  },

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    try {
      const teachers = await this.getTeachers();
      const teacher = teachers.find(t => t.id === id);
      return teacher ? { ...teacher } : undefined;
    } catch {
      const teachers = dataStore.getCollection<Teacher>('teachers');
      const teacher = teachers.find(t => t.id === id);
      return teacher ? { ...teacher } : undefined;
    }
  },

  async createTeacher(teacherData: Omit<Teacher, 'id' | 'employee_no'>): Promise<Teacher> {
    const teachersStore = dataStore.getCollection<Teacher>('teachers');
    try {
      const created = await apiFetch<Teacher>('/teachers', {
        method: 'POST',
        body: JSON.stringify(teacherData),
      });
      dataStore.setCollection('teachers', [created, ...teachersStore]);
      return created;
    } catch (err) {
      console.warn('Backend API error on create teacher:', err);
      const id = `tch-${teachersStore.length + 1}`;
      const employee_no = `EMP-T${String(teachersStore.length + 1).padStart(2, '0')}`;
      const newTeacher: Teacher = {
        ...teacherData,
        id,
        employee_no,
      };
      dataStore.setCollection('teachers', [newTeacher, ...teachersStore]);
      return newTeacher;
    }
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher> {
    const teachersStore = dataStore.getCollection<Teacher>('teachers');
    const index = teachersStore.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Teacher not found');
    
    teachersStore[index] = { ...teachersStore[index], ...updates };
    dataStore.setCollection('teachers', teachersStore);
    return Promise.resolve({ ...teachersStore[index] });
  },

  async deleteTeacher(id: string): Promise<boolean> {
    const teachersStore = dataStore.getCollection<Teacher>('teachers');
    dataStore.setCollection('teachers', teachersStore.filter(t => t.id !== id));
    return Promise.resolve(true);
  }
};

