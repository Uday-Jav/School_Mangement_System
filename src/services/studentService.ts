import { Student } from '../types';
import { apiFetch } from './apiClient';
import { dataStore } from './dataStore';

export const studentService = {
  async getStudents(): Promise<Student[]> {
    try {
      const data = await apiFetch<Student[]>('/students');
      if (Array.isArray(data)) {
        dataStore.setCollection('students', data);
        return data;
      }
      return [];
    } catch (err) {
      console.warn('API error:', err);
      return [];
    }
  },

  async getStudentById(id: string): Promise<Student | undefined> {
    try {
      const students = await this.getStudents();
      const student = students.find(s => s.id === id);
      return student ? { ...student } : undefined;
    } catch {
      const students = dataStore.getCollection<Student>('students');
      const student = students.find(s => s.id === id);
      return student ? { ...student } : undefined;
    }
  },

  async createStudent(studentData: Omit<Student, 'id' | 'admission_no'>): Promise<Student> {
    const students = dataStore.getCollection<Student>('students');
    try {
      const created = await apiFetch<Student>('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
      dataStore.setCollection('students', [created, ...students]);
      return created;
    } catch (err) {
      console.warn('Backend API error on create, adding to local state:', err);
      const id = `std-${students.length + 1}`;
      const admission_no = `ADM-2024-${String(students.length + 1).padStart(3, '0')}`;
      const newStudent: Student = {
        ...studentData,
        id,
        admission_no,
      };
      dataStore.setCollection('students', [newStudent, ...students]);
      return newStudent;
    }
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    const students = dataStore.getCollection<Student>('students');
    const index = students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    students[index] = { ...students[index], ...updates };
    dataStore.setCollection('students', students);
    return Promise.resolve({ ...students[index] });
  },

  async deleteStudent(id: string): Promise<boolean> {
    const students = dataStore.getCollection<Student>('students');
    try {
      await apiFetch<{ message: string }>(`/students/${id}`, { method: 'DELETE' });
      dataStore.setCollection('students', students.filter(s => s.id !== id));
      return true;
    } catch {
      dataStore.setCollection('students', students.filter(s => s.id !== id));
      return true;
    }
  }
};

