import { AppUser } from '../types';
import { dataStore } from './dataStore';

export const userService = {
  async getUsers(): Promise<AppUser[]> {
    return Promise.resolve(dataStore.getCollection<AppUser>('users'));
  },

  async createUser(user: Omit<AppUser, 'id'>): Promise<AppUser> {
    const users = dataStore.getCollection<AppUser>('users');
    
    if (users.find(u => u.email === user.email)) {
      throw new Error('Email address already exists.');
    }

    const newUser: AppUser = {
      ...user,
      id: `usr-${Date.now()}`
    };
    
    users.push(newUser);
    dataStore.setCollection('users', users);
    return Promise.resolve(newUser);
  },

  async updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
    const users = dataStore.getCollection<AppUser>('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    
    if (updates.email && updates.email !== users[idx].email) {
      if (users.find(u => u.email === updates.email)) {
        throw new Error('Email address already exists.');
      }
    }

    users[idx] = { ...users[idx], ...updates };
    dataStore.setCollection('users', users);
    return Promise.resolve(users[idx]);
  },

  async deactivateUser(id: string): Promise<void> {
    const users = dataStore.getCollection<AppUser>('users');
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx].status = 'Inactive';
      dataStore.setCollection('users', users);
    }
    return Promise.resolve();
  }
};
