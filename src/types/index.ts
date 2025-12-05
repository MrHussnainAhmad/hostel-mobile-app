export type Role = 'STUDENT' | 'MANAGER' | 'ADMIN' | 'SUBADMIN';

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName?: string;
  isTerminated: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ApiError {
  success: false;
  message: string;
}

// Auth
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  role: 'STUDENT' | 'MANAGER';
  fullName?: string;
}

// Student Profile
export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  fatherName?: string;
  instituteName?: string;
  permanentAddress?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  isSelfVerified: boolean;
  user: User;
}

// Manager Profile
export interface ManagerProfile {
  id: string;
  userId: string;
  fullName?: string;
  phone?: string;
  isVerified: boolean;
  user: User;
}

// Hostel
export interface Hostel {
  id: string;
  hostelName: string;
  city: string;
  address: string;
  nearbyLocations: string[];
  hostelFor: 'BOYS' | 'GIRLS';
  roomImages: string[];
  rules?: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  roomTypes: RoomType[];
  facilities: Facilities;
  manager?: {
    id: string;
    fullName?: string;
    phone?: string;
  };
}

export interface RoomType {
  id: string;
  type: 'SHARED' | 'PRIVATE' | 'SHARED_FULLROOM';
  totalRooms: number;
  personsInRoom: number;
  price: number;
  fullRoomPriceDiscounted?: number;
  availableRooms: number;
}

export interface Facilities {
  hotColdWaterBath: boolean;
  drinkingWater: boolean;
  electricityBackup: boolean;
  electricityType: 'INCLUDED' | 'SELF';
  electricityRatePerUnit?: number;
  wifiEnabled: boolean;
  wifiPlan?: string;
  wifiMaxUsers?: number;
  wifiAvgSpeed?: string;
  customFacilities: string[];
}

// Reservation
export interface Reservation {
  id: string;
  hostelId: string;
  studentId: string;
  roomType: 'SHARED' | 'PRIVATE' | 'SHARED_FULLROOM';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  message?: string;
  rejectReason?: string;
  createdAt: string;
  hostel: Hostel;
}

// Booking
export interface Booking {
  id: string;
  hostelId: string;
  studentId: string;
  roomType: 'SHARED' | 'PRIVATE' | 'SHARED_FULLROOM';
  status: 'PENDING' | 'APPROVED' | 'DISAPPROVED' | 'LEFT' | 'KICKED';
  transactionImage: string;
  transactionDate: string;
  transactionTime: string;
  fromAccount: string;
  toAccount: string;
  refundImage?: string;
  refundDate?: string;
  refundTime?: string;
  kickReason?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  hostel: Hostel;
}

// Chat
export interface Conversation {
  id: string;
  studentId: string;
  managerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  student?: StudentProfile;
  manager?: ManagerProfile;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

// Report
export interface Report {
  id: string;
  bookingId: string;
  description: string;
  status: 'PENDING' | 'RESOLVED';
  decision?: 'STUDENT_FAULT' | 'MANAGER_FAULT' | 'NONE';
  finalResolution?: string;
  createdAt: string;
  booking: Booking;
}