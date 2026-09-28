import { Vehicle, Route, StudentTransport } from '../types';
import { dataStore } from './dataStore';

export const transportService = {
  async getVehicles(): Promise<Vehicle[]> {
    const vehicles = dataStore.getCollection<Vehicle>('vehicles');
    return Promise.resolve(vehicles);
  },

  async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const vehicles = dataStore.getCollection<Vehicle>('vehicles');
    const newV = { ...vehicle, id: `veh-${Date.now()}` };
    vehicles.push(newV);
    dataStore.setCollection('vehicles', vehicles);
    return Promise.resolve(newV);
  },

  async getRoutes(): Promise<Route[]> {
    const routes = dataStore.getCollection<Route>('routes');
    return Promise.resolve(routes);
  },

  async addRoute(route: Omit<Route, 'id'>): Promise<Route> {
    const routes = dataStore.getCollection<Route>('routes');
    const newR = { ...route, id: `rt-${Date.now()}` };
    routes.push(newR);
    dataStore.setCollection('routes', routes);
    return Promise.resolve(newR);
  },

  async getAssignments(): Promise<StudentTransport[]> {
    const assignments = dataStore.getCollection<StudentTransport>('studentTransport');
    return Promise.resolve(assignments);
  },

  async assignStudent(assignment: Omit<StudentTransport, 'id'>): Promise<StudentTransport> {
    const assignments = dataStore.getCollection<StudentTransport>('studentTransport');
    
    // Validate duplicate assignment
    const existing = assignments.find(a => a.student_id === assignment.student_id && a.status === 'Active');
    if (existing) {
      throw new Error('Student is already assigned to a route.');
    }

    // Capacity validation
    const routeAssignments = assignments.filter(a => a.route_name === assignment.route_name && a.status === 'Active');
    const vehicles = dataStore.getCollection<Vehicle>('vehicles');
    const routes = dataStore.getCollection<Route>('routes');
    
    const route = routes.find(r => r.route_name === assignment.route_name);
    if (!route) throw new Error('Route not found');

    const vehicle = vehicles.find(v => v.id === route.assigned_vehicle || v.vehicle_number === assignment.vehicle_number);
    if (vehicle && routeAssignments.length >= vehicle.capacity) {
      throw new Error('Vehicle capacity exceeded for this route.');
    }

    const newA = { ...assignment, id: `trn-${Date.now()}` };
    assignments.push(newA);
    dataStore.setCollection('studentTransport', assignments);
    return Promise.resolve(newA);
  }
};
