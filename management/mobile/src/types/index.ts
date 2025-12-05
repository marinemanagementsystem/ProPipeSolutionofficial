import { Timestamp } from 'firebase/firestore';

// ==================== USER ====================
export type UserRole = 'ADMIN' | 'super_admin' | 'ORTAK' | 'MUHASEBE';

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ==================== EXPENSE ====================
export type ExpenseType = 'COMPANY_OFFICIAL' | 'PERSONAL' | 'ADVANCE';
export type ExpenseStatus = 'PAID' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';
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
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedByUserId?: string;
  deletedByEmail?: string;
  deletedByDisplayName?: string;
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
  receiptFile?: any; // File for upload (URI string in mobile)
}

export interface ExpenseHistoryEntry {
  id: string;
  expenseId: string;
  previousData: Expense;
  changedAt: Timestamp;
  changedByUserId: string;
  changedByEmail?: string;
  changedByDisplayName?: string;
  changeType: 'UPDATE' | 'DELETE' | 'REVERT';
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
  createdByEmail?: string;
  createdByDisplayName?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
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
  createdByEmail?: string;
  createdByDisplayName?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
}

export interface StatementLine {
  id: string;
  statementId: string;
  description: string;
  amount: number;
  direction: LineDirection;
  category?: string;
  isPaid: boolean;
  relatedExpenseId?: string;
  partnerId?: string;
  paidAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  isDeleted?: boolean;
}

export interface ProjectHistoryEntry {
  id: string;
  projectId: string;
  previousData: Project;
  changedAt: Timestamp;
  changedByUserId: string;
  changedByEmail?: string | null;
  changedByDisplayName?: string | null;
  changeType: 'UPDATE' | 'DELETE' | 'REVERT';
}

export interface StatementHistoryEntry {
  id: string;
  statementId: string;
  previousData?: ProjectStatement | StatementLine | null;
  newData?: StatementLine;
  changedAt: Timestamp;
  changedByUserId: string;
  changedByEmail?: string | null;
  changedByDisplayName?: string | null;
  changeType: 'UPDATE' | 'DELETE' | 'REVERT' | 'STATUS_CHANGE' | 'LINE_ADD' | 'LINE_UPDATE' | 'LINE_DELETE' | 'CLOSE';
  lineId?: string;
  lineDescription?: string;
  lineAmount?: number;
  lineDirection?: 'INCOME' | 'EXPENSE';
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
  createdByEmail?: string;
  createdByDisplayName?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
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
  createdBy?: string;
  createdByEmail?: string;
  createdByDisplayName?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
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

export interface PartnerStatementHistoryEntry {
  id: string;
  statementId: string;
  partnerId: string;
  previousData: Partial<PartnerStatement>;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'CLOSE' | 'REOPEN';
  changedAt: Timestamp;
  changedByUserId: string;
  changedByEmail?: string;
  changedByDisplayName?: string;
}

// ==================== NETWORK ====================
// Synchronized with web types (src/types/Network.ts)
export type NetworkCategory = 'YENI_INSA' | 'TAMIR' | 'YAT' | 'ASKERI_PROJE' | 'TANKER' | 'DIGER';
export type ServiceArea = 'BORU' | 'BORU_TECHIZ' | 'DIGER';
export type ContactStatus = 'ULASILDI' | 'ULASILMIYOR' | 'BEKLEMEDE';
export type QuoteStatus = 'HAYIR' | 'TEKLIF_BEKLENIYOR' | 'TEKLIF_VERILDI' | 'TEKLIF_VERILECEK' | 'GORUSME_DEVAM_EDIYOR';
export type ResultStatus = 'BEKLEMEDE' | 'KAZANILDI' | 'RED' | 'IS_YOK' | 'DONUS_YOK';

// Legacy type alias for backward compatibility
export type ContactCategory = NetworkCategory;
export type ContactResult = ResultStatus;

export interface NetworkContact {
  id: string;
  companyName: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  category: NetworkCategory;
  serviceArea?: ServiceArea;
  shipType?: string;
  contactStatus: ContactStatus;
  quoteStatus: QuoteStatus;
  quoteDate?: Timestamp;
  result?: ResultStatus;
  lastContactDate?: Timestamp;
  nextActionDate?: Timestamp;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  createdByEmail?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
  isDeleted?: boolean;
  deletedAt?: Timestamp;
}

export interface NetworkContactFormData {
  companyName: string;
  contactPerson: string;
  phone?: string;
  email?: string;
  category: NetworkCategory;
  serviceArea?: ServiceArea;
  shipType?: string;
  contactStatus: ContactStatus;
  quoteStatus: QuoteStatus;
  quoteDate?: Date;
  result?: ResultStatus;
  lastContactDate?: Date;
  nextActionDate?: Date;
  notes?: string;
}

export interface NetworkHistoryEntry {
  id: string;
  contactId: string;
  previousData: NetworkContact;
  changedAt: Timestamp;
  changedByUserId: string;
  changedByEmail?: string | null;
  changedByDisplayName?: string | null;
  changeType: 'UPDATE' | 'DELETE' | 'REVERT';
}

// ==================== COMPANY OVERVIEW ====================
export interface CompanyOverview {
  id: string;
  companySafeBalance: number;
  currency: Currency;
  lastUpdatedAt: Timestamp | null;
  updatedBy?: string;
  updatedByUserId?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
}

export interface CompanyOverviewFormData {
  companySafeBalance: number;
  currency?: Currency;
}

export const DEFAULT_COMPANY_OVERVIEW: Omit<CompanyOverview, 'id' | 'lastUpdatedAt'> = {
  companySafeBalance: 0,
  currency: 'TRY',
};

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

// Statement with project name (for dashboard)
export interface StatementWithProject extends ProjectStatement {
  projectName: string;
}

// Statement trend item
export interface StatementTrendItem {
  monthLabel: string;
  monthKey: string;
  totalNetCash: number;
  statementCount: number;
}

// ==================== HELPER FUNCTIONS ====================

// Calculate next month balance for partner statements
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

// Month names in Turkish
export const MONTH_NAMES: Record<number, string> = {
  1: 'Ocak',
  2: 'Şubat',
  3: 'Mart',
  4: 'Nisan',
  5: 'Mayıs',
  6: 'Haziran',
  7: 'Temmuz',
  8: 'Ağustos',
  9: 'Eylül',
  10: 'Ekim',
  11: 'Kasım',
  12: 'Aralık',
};

// ==================== LABEL HELPER FUNCTIONS ====================

export const getCategoryLabel = (category: NetworkCategory): string => {
  const labels: Record<NetworkCategory, string> = {
    'YENI_INSA': 'Yeni İnşa',
    'TAMIR': 'Tamir',
    'YAT': 'Yat',
    'ASKERI_PROJE': 'Askeri Proje',
    'TANKER': 'Tanker',
    'DIGER': 'Diğer',
  };
  return labels[category] || category;
};

export const getServiceAreaLabel = (area: ServiceArea): string => {
  const labels: Record<ServiceArea, string> = {
    'BORU': 'Boru',
    'BORU_TECHIZ': 'Boru Techiz',
    'DIGER': 'Diğer',
  };
  return labels[area] || area;
};

export const getContactStatusLabel = (status: ContactStatus): string => {
  const labels: Record<ContactStatus, string> = {
    'ULASILDI': 'Ulaşıldı',
    'ULASILMIYOR': 'Ulaşılmıyor',
    'BEKLEMEDE': 'Beklemede',
  };
  return labels[status] || status;
};

export const getQuoteStatusLabel = (status: QuoteStatus): string => {
  const labels: Record<QuoteStatus, string> = {
    'HAYIR': 'Hayır',
    'TEKLIF_BEKLENIYOR': 'Teklif Bekleniyor',
    'TEKLIF_VERILDI': 'Teklif Verildi',
    'TEKLIF_VERILECEK': 'Teklif Verilecek',
    'GORUSME_DEVAM_EDIYOR': 'Görüşme Devam Ediyor',
  };
  return labels[status] || status;
};

export const getResultStatusLabel = (status: ResultStatus): string => {
  const labels: Record<ResultStatus, string> = {
    'BEKLEMEDE': 'Beklemede',
    'KAZANILDI': 'Kazanıldı',
    'RED': 'Red',
    'IS_YOK': 'İş Yok',
    'DONUS_YOK': 'Dönüş Yok',
  };
  return labels[status] || status;
};

export const getExpenseTypeLabel = (type: ExpenseType): string => {
  const labels: Record<ExpenseType, string> = {
    'COMPANY_OFFICIAL': 'Şirket Resmi',
    'PERSONAL': 'Kişisel',
    'ADVANCE': 'Avans',
  };
  return labels[type] || type;
};

export const getExpenseStatusLabel = (status: ExpenseStatus): string => {
  const labels: Record<ExpenseStatus, string> = {
    'PAID': 'Ödendi',
    'UNPAID': 'Ödenmedi',
  };
  return labels[status] || status;
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    'CASH': 'Nakit',
    'CARD': 'Kredi Kartı',
    'TRANSFER': 'Havale',
  };
  return labels[method] || method;
};

export const getTransferActionLabel = (action: TransferAction): string => {
  const labels: Record<TransferAction, string> = {
    'NONE': 'İşlem Yok',
    'TRANSFERRED_TO_SAFE': 'Kasaya Aktarıldı',
    'CARRIED_OVER': 'Devredildi',
  };
  return labels[action] || action;
};
