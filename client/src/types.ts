export type UserRole = 'admin' | 'coach' | 'family';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  familyId?: string;
  forcePasswordChange: boolean;
}

export interface Family {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  totalCredits: number;
  memberCount?: number;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  birthDate?: string;
  weight?: number;
  isActive: boolean;
  familyId: string;
  familyName?: string;
  availableCredits?: number;
}

export interface CourseType {
  id: string;
  name: string;
  color?: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  date: string;
  time: string;
  courseTypeId: string;
  courseType?: CourseType;
  createdBy?: string;
  notes?: string;
  attendanceCount?: number;
  attendances?: Attendance[];
}

export interface Attendance {
  id: string;
  courseId: string;
  memberId: string;
  member?: Member;
  creditPurchaseId?: string;
  createdAt: string;
}

export interface CreditPurchase {
  id: string;
  amount: number;
  remaining: number;
  note?: string;
  purchaseDate: string;
  addedBy?: string;
}

export interface ActivityLogEntry {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  details?: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
}