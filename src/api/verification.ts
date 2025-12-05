import apiClient from './client';

export interface Verification {
  id: string;
  managerId: string;
  initialHostelNames: string[];
  ownerName: string;
  city: string;
  address: string;
  buildingImages: string[];
  hostelFor: 'BOYS' | 'GIRLS';
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  customBanks: { bankName: string; accountNumber: string; iban?: string }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment?: string;
  createdAt: string;
}

export const verificationApi = {
  // Manager: Submit verification
  submit: async (formData: FormData): Promise<{ success: boolean; data: Verification }> => {
    const response = await apiClient.post('/verifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Manager: Get my verifications
  getMyVerifications: async (): Promise<{ success: boolean; data: Verification[] }> => {
    const response = await apiClient.get('/verifications/my');
    return response.data;
  },
};