import { Timestamp } from 'firebase/firestore';

// ==================== USER ====================
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'ADMIN' | 'super_admin' | 'Ortak' | 'Muhasebe';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== EXPENSE ====================
export type ExpenseType = 'COMPANY_OFFICIAL' | 'PERSONAL' | 'ADVANCE';
export type ExpenseStatus = 'PAID' | 'UNPAID';
export type PaymentMethod = 'NAKIT' | 'HAVALE' | 'KREDI_KARTI' | 'CEK';
export type Currency = 'TRY' | 'USD' | 'EUR';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Timestamp;
  type: ExpenseType;
  status: ExpenseStatus;
  ownerId: string;
  currency: Currency;
  paymentMethod: PaymentMethod;
  projectId?: string;
  category?: string;
  receiptUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  createdByEmail?: string;
  createdByDisplayName?: string;
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedByUserId?: string;
}

export interface ExpenseFormData {
  amount: number;
  description: string;
  date: Date;
  type: ExpenseType;
  status: ExpenseStatus;
  ownerId: string;
  currency: Currency;
  paymentMethod: PaymentMethod;
  projectId?: string;
  category?: string;
  receiptFile?: any; // File for upload
}

// ==================== PROJECT ====================
export interface Project {
  id: string;
  name: string;
  location?: string;
  contactPerson?: string;
  phone?: string;
  currentBalance: number;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

export type StatementStatus = 'DRAFT' | 'CLOSED';
export type TransferAction = 'NONE' | 'TRANSFERRED_TO_SAFE' | 'CARRIED_OVER';
export type LineDirection = 'INCOME' | 'EXPENSE';

export interface ProjectStatement {
  id: string;
  projectId: string;
  title: string;
  date: Timestamp;
  status: StatementStatus;
  totals: {
    totalIncome: number;
    totalExpensePaid: number;
    totalExpenseUnpaid: number;
    netCashReal: number;
  };
  previousBalance: number;
  finalBalance: number;
  transferAction: TransferAction;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

export interface StatementLine {
  id: string;
  statementId: string;
  description: string;
  amount: number;
  direction: LineDirection;
  isPaid: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== PARTNER ====================
export interface Partner {
  id: string;
  name: string;
  sharePercentage: number;
  baseSalary: number;
  currentBalance: number;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

export interface PartnerStatement {
  id: string;
  partnerId: string;
  month: number;
  year: number;
  status: 'DRAFT' | 'CLOSED';
  previousBalance: number;
  personalExpenseReimbursement: number;
  monthlySalary: number;
  profitShare: number;
  actualWithdrawn: number;
  nextMonthBalance: number;
  note?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface PartnerFormData {
  name: string;
  sharePercentage: number;
  baseSalary: number;
}

export interface PartnerStatementFormData {
  month: number;
  year: number;
  previousBalance: number;
  personalExpenseReimbursement: number;
  monthlySalary: number;
  profitShare: number;
  actualWithdrawn: number;
  note?: string;
}

// ==================== NETWORK ====================
export type ContactCategory = 'YENI_INSA' | 'TAMIR' | 'YAT' | 'ASKERI_PROJE' | 'TANKER' | 'DIGER';
export type ContactStatus = 'ILK_TEMAS' | 'TEKLIF_ASAMASI' | 'GORUSME_DEVAM' | 'KAPALI';
export type QuoteStatus = 'HAYIR' | 'TEKLIF_BEKLENIYOR' | 'TEKLIF_VERILDI' | 'TEKLIF_VERILECEK' | 'GORUSME_DEVAM_EDIYOR';
export type ContactResult = 'IS_ALINDI' | 'RED' | 'IS_YOK' | 'DEVAM_EDIYOR' | 'DONUS_YOK';

export interface NetworkContact {
  id: string;
  companyName: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  category: ContactCategory;
  serviceArea?: string;
  shipType?: string;
  contactStatus: ContactStatus;
  quoteStatus: QuoteStatus;
  quoteDate?: Timestamp;
  result?: ContactResult;
  notes?: string;
  lastContactDate?: Timestamp;
  nextActionDate?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isDeleted?: boolean;
}

export interface NetworkContactFormData {
  companyName: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  category: ContactCategory;
  serviceArea?: string;
  shipType?: string;
  contactStatus: ContactStatus;
  quoteStatus: QuoteStatus;
  quoteDate?: Date;
  result?: ContactResult;
  notes?: string;
}

// ==================== COMPANY OVERVIEW ====================
export interface CompanyOverview {
  id: string;
  companySafeBalance: number;
  currency: Currency;
  lastUpdatedAt: Timestamp | null;
  updatedBy?: string;
}

// ==================== DASHBOARD ====================
export interface DashboardSummary {
  companySafeBalance: number;
  currency: string;
  lastUpdatedAt: Timestamp | null;
  totalProjectsBalance: number;
  totalProjectsCount: number;
  totalPaidExpensesThisMonth: number;
  totalPartnersPositive: number;
  totalPartnersNegative: number;
}

// Helper function
export const calculateNextMonthBalance = (
  previousBalance: number,
  personalExpenseReimbursement: number,
  monthlySalary: number,
  profitShare: number,
  actualWithdrawn: number
): number => {
  const hakEdis = personalExpenseReimbursement + monthlySalary + profitShare;
  return previousBalance + actualWithdrawn - hakEdis;
};
