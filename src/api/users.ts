import { ManagerProfile, StudentProfile } from "@/types";
import apiClient from "./client";

export const usersApi = {
  // Manager: Get profile
  getManagerProfile: async (): Promise<{
    success: boolean;
    data: ManagerProfile;
  }> => {
    const response = await apiClient.get("/users/manager/profile");
    return response.data;
  },

  // Manager: Update profile
  updateManagerProfile: async (data: {
    fullName?: string;
    phone?: string;
  }): Promise<{ success: boolean; data: ManagerProfile }> => {
    const response = await apiClient.patch("/users/manager/profile", data);
    return response.data;
  },

  // Student: Get profile
  getStudentProfile: async (): Promise<{
    success: boolean;
    data: StudentProfile;
  }> => {
    const response = await apiClient.get("/users/student/profile");
    return response.data;
  },

  // Student: Self verify
  selfVerify: async (data: {
    fatherName: string;
    instituteName: string;
    permanentAddress: string;
    phoneNumber: string;
    whatsappNumber: string;
  }): Promise<{ success: boolean; data: StudentProfile }> => {
    const response = await apiClient.post("/users/student/self-verify", data);
    return response.data;
  },

  // ============================
  // NEW: Self delete my account
  // ============================
  deleteMyAccount: async (): Promise<{
    success: boolean;
    data: { message: string };
  }> => {
    const response = await apiClient.delete("/users/delete");
    return response.data;
  },
};
