import { ClassEntity, Section } from '../types';
import { apiFetch } from './apiClient';
import { dataStore } from './dataStore';

export const classService = {
  async getClasses(): Promise<ClassEntity[]> {
    try {
      const data = await apiFetch<ClassEntity[]>('/classes');
      if (Array.isArray(data)) {
        dataStore.setCollection('classes', data);
        return data;
      }
      return dataStore.getCollection<ClassEntity>('classes');
    } catch (e) {
      console.warn('Backend API unreachable, using local store:', e);
      return dataStore.getCollection<ClassEntity>('classes');
    }
  },

  async getSections(): Promise<Section[]> {
    try {
      const data = await apiFetch<Section[]>('/sections');
      if (Array.isArray(data)) {
        dataStore.setCollection('sections', data);
        return data;
      }
      return dataStore.getCollection<Section>('sections');
    } catch (e) {
      console.warn('Backend API unreachable, using local store:', e);
      return dataStore.getCollection<Section>('sections');
    }
  },

  async getSectionsByClassId(classId: string): Promise<Section[]> {
    try {
      const sections = await this.getSections();
      return sections.filter(s => s.class_id === classId);
    } catch (e) {
      const sections = dataStore.getCollection<Section>('sections');
      return sections.filter(s => s.class_id === classId);
    }
  },

  async createClass(classData: Omit<ClassEntity, 'id' | 'total_students' | 'sections_count'>): Promise<ClassEntity> {
    const classes = dataStore.getCollection<ClassEntity>('classes');
    try {
      const created = await apiFetch<ClassEntity>('/classes', {
        method: 'POST',
        body: JSON.stringify(classData)
      });
      dataStore.setCollection('classes', [...classes, created]);
      return created;
    } catch (err) {
      const id = `cls-${Date.now()}`;
      const newClass: ClassEntity = {
        ...classData,
        id,
        total_students: 0,
        sections_count: 0
      };
      dataStore.setCollection('classes', [...classes, newClass]);
      return newClass;
    }
  },

  async createSection(sectionData: Omit<Section, 'id' | 'current_students'>): Promise<Section> {
    const sections = dataStore.getCollection<Section>('sections');
    try {
      const created = await apiFetch<Section>('/sections', {
        method: 'POST',
        body: JSON.stringify(sectionData)
      });
      dataStore.setCollection('sections', [...sections, created]);
      return created;
    } catch (err) {
      const id = `sec-${Date.now()}`;
      const newSec: Section = {
        ...sectionData,
        id,
        current_students: 0
      };
      dataStore.setCollection('sections', [...sections, newSec]);
      return newSec;
    }
  }
};

