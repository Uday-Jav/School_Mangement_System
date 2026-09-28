import { Notice } from '../types';
import { apiFetch } from './apiClient';
import { dataStore } from './dataStore';

export const noticeService = {
  async getNotices(): Promise<Notice[]> {
    try {
      const data = await apiFetch<Notice[]>('/notices');
      if (Array.isArray(data) ) {
        dataStore.setCollection('notices', data);
        return data;
      }
      return dataStore.getCollection<Notice>('notices');
    } catch {
      return dataStore.getCollection<Notice>('notices');
    }
  },
  async createNotice(noticeData: Omit<Notice, 'id'>): Promise<Notice> {
    const noticesStore = dataStore.getCollection<Notice>('notices');
    const newNotice: Notice = { ...noticeData, id: `not-${noticesStore.length + 1}` };
    dataStore.setCollection('notices', [newNotice, ...noticesStore]);
    return Promise.resolve(newNotice);
  },
  async deleteNotice(id: string): Promise<boolean> {
    const noticesStore = dataStore.getCollection<Notice>('notices');
    dataStore.setCollection('notices', noticesStore.filter(n => n.id !== id));
    return Promise.resolve(true);
  }
};

