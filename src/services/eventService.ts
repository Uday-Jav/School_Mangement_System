import { Event } from '../types';
import { mockEvents } from '../data/mockData';

let eventsStore: Event[] = [...mockEvents];

export const eventService = {
  async getEvents(): Promise<Event[]> {
    return Promise.resolve([...eventsStore]);
  },
  async createEvent(eventData: Omit<Event, 'id' | 'participant_count'>): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `evt-${eventsStore.length + 1}`,
      participant_count: eventData.participants.length
    };
    eventsStore = [newEvent, ...eventsStore];
    return Promise.resolve(newEvent);
  }
};
