import { Reservation } from '@/types';
import apiClient from './client';

export const reservationsApi = {
  // Manager: Get hostel reservations
  getHostelReservations: async (hostelId: string): Promise<{ success: boolean; data: Reservation[] }> => {
    const response = await apiClient.get(`/reservations/hostel/${hostelId}`);
    return response.data;
  },

  // Manager: Review reservation
  review: async (id: string, data: { status: 'ACCEPTED' | 'REJECTED'; rejectReason?: string }): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/reservations/${id}/review`, data);
    return response.data;
  },

  // Student: Create reservation
  create: async (data: { hostelId: string; roomType: string; message?: string }): Promise<{ success: boolean; data: Reservation }> => {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  // Student: Get my reservations
  getMyReservations: async (): Promise<{ success: boolean; data: Reservation[] }> => {
    const response = await apiClient.get('/reservations/my');
    return response.data;
  },

  // Student: Cancel reservation
  cancel: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/reservations/${id}/cancel`);
    return response.data;
  },
};