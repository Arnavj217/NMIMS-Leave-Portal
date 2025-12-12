import { User, LeaveRequest, LoginResponse, LeaveStatus } from '../types';

const USERS_KEY = 'nmims_users_v1';
const LEAVES_KEY = 'nmims_leaves_v1';

// Helper to get data
const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

const getLeaves = (): LeaveRequest[] => {
  const data = localStorage.getItem(LEAVES_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save data
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const saveLeaves = (leaves: LeaveRequest[]) => {
  localStorage.setItem(LEAVES_KEY, JSON.stringify(leaves));
};

// Authentication
export const registerUser = (user: User): LoginResponse => {
  const users = getUsers();
  if (users.find(u => u.email === user.email)) {
    return { success: false, message: 'User with this email already exists.' };
  }
  users.push(user);
  saveUsers(users);
  return { success: true, message: 'Registration successful!', user };
};

export const loginUser = (email: string, pass: string, role: string): LoginResponse => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === pass && u.role === role);
  
  if (user) {
    // Return user without sensitive data if needed, but for local app we pass full object
    return { success: true, message: 'Login successful', user };
  }
  return { success: false, message: 'Invalid credentials or role.' };
};

// Leave Management
export const createLeaveRequest = (request: LeaveRequest) => {
  const leaves = getLeaves();
  leaves.push(request);
  saveLeaves(leaves);
};

export const updateLeaveRequest = (updatedLeave: LeaveRequest) => {
  const leaves = getLeaves();
  const index = leaves.findIndex(l => l.id === updatedLeave.id);
  if (index !== -1) {
    leaves[index] = updatedLeave;
    saveLeaves(leaves);
  }
};

export const getStudentLeaves = (studentEmail: string): LeaveRequest[] => {
  const leaves = getLeaves();
  return leaves.filter(l => l.studentEmail === studentEmail).reverse();
};

export const getParentLeaves = (parentEmail: string): LeaveRequest[] => {
  const leaves = getLeaves();
  // Parent sees requests where they are listed as the parent
  return leaves.filter(l => l.parentEmail === parentEmail).reverse();
};

export const getMentorLeaves = (mentorEmail: string): LeaveRequest[] => {
  const leaves = getLeaves();
  // Mentor ONLY sees requests if Parent has APPROVED
  return leaves.filter(l => 
    l.mentorEmail === mentorEmail && 
    l.parentStatus === LeaveStatus.APPROVED
  ).reverse();
};