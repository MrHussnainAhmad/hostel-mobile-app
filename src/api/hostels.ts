import { Hostel } from '@/types';
import apiClient from './client';

export const hostelsApi = {
  // =========================
  // MANAGER ENDPOINTS
  // =========================

  // Manager: Get my hostels
  getMyHostels: async (): Promise<{ success: boolean; data: Hostel[] }> => {
    const response = await apiClient.get('/hostels/manager/my');
    return response.data;
  },

  // Manager: Create hostel
  // Backend already supports roomTypes with urgentBookingPrice, facilities, etc.
  createHostel: async (formData: FormData): Promise<{ success: boolean; data: Hostel }> => {
    const response = await apiClient.post('/hostels', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Manager: Update hostel
  updateHostel: async (
    id: string,
    formData: FormData
  ): Promise<{ success: boolean; data: Hostel }> => {
    const response = await apiClient.patch(`/hostels/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Manager: Delete hostel
  deleteHostel: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/hostels/${id}`);
    return response.data;
  },

  // Manager: Get hostel students (active APPROVED bookings)
  getHostelStudents: async (
    hostelId: string
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get(`/hostels/${hostelId}/students`);
    return response.data;
  },

  // =========================
  // PUBLIC ENDPOINTS
  // =========================

  // Public: Get hostel by ID
  getById: async (id: string): Promise<{ success: boolean; data: Hostel }> => {
    const response = await apiClient.get(`/hostels/${id}`);
    return response.data;
  },

  // Public: Search hostels (backend handles roomTypes + price range)
  search: async (params: {
    city?: string;
    hostelFor?: 'BOYS' | 'GIRLS';
    roomType?: string;
  }): Promise<{ success: boolean; data: Hostel[] }> => {
    const response = await apiClient.get('/hostels/search', { params });
    return response.data;
  },
};
