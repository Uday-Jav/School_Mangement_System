import { Event } from '../types';
import { dataStore } from './dataStore';

export const eventsService = {
  async getEvents(): Promise<Event[]> {
    return Promise.resolve(dataStore.getCollection<Event>('events'));
  },

  async addEvent(event: Omit<Event, 'id' | 'participant_count' | 'participants'>): Promise<Event> {
    const events = dataStore.getCollection<Event>('events');
    const newE: Event = {
      ...event,
      id: `evt-${Date.now()}`,
      participant_count: 0,
      participants: []
    };
    events.push(newE);
    dataStore.setCollection('events', events);
    return Promise.resolve(newE);
  },

  async registerParticipant(eventId: string, studentId: string): Promise<Event> {
    const events = dataStore.getCollection<Event>('events');
    const idx = events.findIndex(e => e.id === eventId);
    if (idx === -1) throw new Error('Event not found');
    
    if (events[idx].participants.includes(studentId)) {
      throw new Error('Already registered');
    }
    
    events[idx].participants.push(studentId);
    events[idx].participant_count += 1;
    dataStore.setCollection('events', events);
    return Promise.resolve(events[idx]);
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const events = dataStore.getCollection<Event>('events');
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    events[idx] = { ...events[idx], ...updates };
    dataStore.setCollection('events', events);
    return Promise.resolve(events[idx]);
  },

  async cancelEvent(id: string): Promise<void> {
    const events = dataStore.getCollection<Event>('events');
    const idx = events.findIndex(e => e.id === id);
    if (idx !== -1) {
      events[idx].status = 'Cancelled';
      dataStore.setCollection('events', events);
    }
    return Promise.resolve();
  }
};
