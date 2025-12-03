import type { Timestamp } from "firebase/firestore";

export type UserRole = "ADMIN" | "ORTAK" | "MUHASEBE";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface CompanyOverview {
  id?: string;
  companySafeBalance: number;
  currency: string;
  lastUpdatedAt?: Timestamp | null;
}

export interface Project {
  id: string;
  name: string;
  currentBalance?: number;
  location?: string;
  manager?: string;
  status?: string;
  budget?: number;
  spent?: number;
}

export interface Partner {
  id: string;
  name: string;
  currentBalance?: number;
  isActive?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date?: Timestamp;
  status: "PAID" | "UNPAID";
  type?: string;
  currency?: string;
  category?: string;
  ownerId?: string;
  isDeleted?: boolean;
}

export interface NetworkAction {
  id: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  category?: string;
  quoteStatus?: string;
  result?: string;
  lastContactDate?: Timestamp;
  nextActionDate?: Timestamp;
  isOverdue?: boolean;
}

export interface DashboardSummary {
  companySafeBalance: number;
  currency: string;
  lastUpdatedAt?: Timestamp | null;
  totalProjectsBalance: number;
  totalProjectsCount: number;
  totalPaidExpensesThisMonth: number;
  totalPartnersPositive: number;
  totalPartnersNegative: number;
  totalExpenses: number;
  unpaidExpenses: number;
  totalPartners: number;
}
