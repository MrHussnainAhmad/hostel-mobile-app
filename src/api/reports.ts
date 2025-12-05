import { Report } from '@/types';
import apiClient from './client';

export const reportsApi = {
  // Student: Create report
  create: async (data: { bookingId: string; description: string }): Promise<{ success: boolean; data: Report }> => {
    const response = await apiClient.post('/reports', data);
    return response.data;
  },

  // Student: Get my reports
  getMyReports: async (): Promise<{ success: boolean; data: Report[] }> => {
    const response = await apiClient.get('/reports/my');
    return response.data;
  },

  // Manager: Get reports against my hostels
  getManagerReports: async (): Promise<{ success: boolean; data: Report[] }> => {
    const response = await apiClient.get('/reports/manager/my');
    return response.data;
  },
};