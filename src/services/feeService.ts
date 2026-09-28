import { FeeType, FeeStructure, Payment } from '../types';
import { apiFetch } from './apiClient';
import { dataStore } from './dataStore';

export const feeService = {
  async getFeeTypes(): Promise<FeeType[]> {
    return Promise.resolve(dataStore.getCollection<FeeType>('feeTypes'));
  },

  async getFeeStructures(): Promise<FeeStructure[]> {
    return Promise.resolve(dataStore.getCollection<FeeStructure>('feeStructures'));
  },

  async getPayments(): Promise<Payment[]> {
    try {
      const data = await apiFetch<Payment[]>('/payments');
      if (Array.isArray(data) ) {
        dataStore.setCollection('payments', data);
        return data;
      }
      return dataStore.getCollection<Payment>('payments');
    } catch {
      return dataStore.getCollection<Payment>('payments');
    }
  },

  async recordPayment(paymentData: Omit<Payment, 'id' | 'receipt_no'>): Promise<Payment> {
    const paymentsStore = dataStore.getCollection<Payment>('payments');
    try {
      const created = await apiFetch<Payment>('/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      dataStore.setCollection('payments', [created, ...paymentsStore]);
      return created;
    } catch {
      const id = `pay-${paymentsStore.length + 1}`;
      const receipt_no = `REC-2026-${String(paymentsStore.length + 1).padStart(3, '0')}`;
      const newPayment: Payment = {
        ...paymentData,
        id,
        receipt_no,
      };
      dataStore.setCollection('payments', [newPayment, ...paymentsStore]);
      return newPayment;
    }
  },

  async reversePayment(paymentId: string): Promise<boolean> {
    const paymentsStore = dataStore.getCollection<Payment>('payments');
    const idx = paymentsStore.findIndex(p => p.id === paymentId);
    if (idx !== -1) {
      paymentsStore[idx] = { ...paymentsStore[idx], status: 'Reversed' as any };
      dataStore.setCollection('payments', paymentsStore);
    }
    return Promise.resolve(true);
  }
};

