import { Booking } from '@/types';
import apiClient from './client';

export const bookingsApi = {
  // =========================
  // MANAGER ENDPOINTS
  // =========================

  // Manager: Get all bookings (all hostels he owns)
  getManagerBookings: async (): Promise<{ success: boolean; data: Booking[] }> => {
    const response = await apiClient.get('/bookings/manager');
    return response.data;
  },

  // Manager: Get bookings for a specific hostel
  getHostelBookings: async (hostelId: string): Promise<{ success: boolean; data: Booking[] }> => {
    const response = await apiClient.get(`/bookings/hostel/${hostelId}`);
    return response.data;
  },

  // Manager: Approve booking
  approve: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/bookings/${id}/approve`);
    return response.data;
  },

  // Manager: Disapprove booking (with refund details)
  disapprove: async (
    id: string,
    data: { refundImage: string; refundDate: string; refundTime: string }
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/bookings/${id}/disapprove`, data);
    return response.data;
  },

  // Manager: Kick student (LEFT_HOSTEL / VIOLATED_RULES)
  kick: async (
    id: string,
    data: { kickReason: 'LEFT_HOSTEL' | 'VIOLATED_RULES' }
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/bookings/${id}/kick`, data);
    return response.data;
  },

  // =========================
  // STUDENT ENDPOINTS
  // =========================

  // Student: Create booking (supports REGULAR / URGENT via backend logic)
  create: async (formData: FormData): Promise<{ success: boolean; data: Booking }> => {
    const response = await apiClient.post('/bookings', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Student: Get my bookings
  getMyBookings: async (): Promise<{ success: boolean; data: Booking[] }> => {
    const response = await apiClient.get('/bookings/my');
    return response.data;
  },

  // Student: Leave hostel (backend handles auto-room increment + status)
  leave: async (data: {
    rating: number;
    review: string;
    reason?: string;
  }): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/bookings/leave', data);
    return response.data;
  },
};
