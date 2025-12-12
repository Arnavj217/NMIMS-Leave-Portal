export enum Role {
  STUDENT = 'Student',
  PARENT = 'Parent',
  MENTOR = 'Mentor'
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Only used for auth check, not displayed
  role: Role;
  // Student fields
  branch?: string;
  course?: string;
  year?: string;
  parentEmail?: string;
  // Parent fields
  studentEmail?: string;
  // Mentor fields
  facultyId?: string;
}

export interface LeaveRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  parentEmail: string;
  mentorEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  
  // Approval Workflow
  parentStatus: LeaveStatus;
  parentComment?: string;
  mentorStatus: LeaveStatus;
  mentorComment?: string;
  
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}