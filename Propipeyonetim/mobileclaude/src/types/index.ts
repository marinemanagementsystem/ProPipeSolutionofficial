import { Timestamp } from "firebase/firestore";

// User Types
export type UserRole = "ADMIN" | "super_admin" | "ORTAK" | "MUHASEBE";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Expense Types
export type ExpenseType = "COMPANY_OFFICIAL" | "PERSONAL" | "ADVANCE";
export type ExpenseStatus = "PAID" | "UNPAID";
export type Currency = "TRY" | "EUR" | "USD";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: Timestamp;
  type: ExpenseType;
  status: ExpenseStatus;
  ownerId: string;
  ownerEmail?: string;
  ownerDisplayName?: string;
  currency: Currency;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;
  projectId?: string;
  category?: string;
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
  paymentMethod?: PaymentMethod;
  projectId?: string;
  category?: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  location: string;
  currentBalance: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  createdByEmail?: string;
  createdByDisplayName?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
}

export interface ProjectFormData {
  name: string;
  location: string;
}

export type StatementStatus = "DRAFT" | "CLOSED";
export type TransferAction = "NONE" | "TRANSFERRED_TO_SAFE" | "CARRIED_OVER";

export interface StatementTotals {
  totalIncome: number;
  totalExpensePaid: number;
  totalExpenseUnpaid: number;
  netCashReal: number;
}

export interface ProjectStatement {
  id: string;
  projectId: string;
  title: string;
  date: Timestamp;
  status: StatementStatus;
  totals: StatementTotals;
  previousBalance: number;
  finalBalance: number;
  transferAction: TransferAction;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy?: string;
  createdByEmail?: string;
  createdByDisplayName?: string;
  updatedBy?: string;
  updatedByEmail?: string;
  updatedByDisplayName?: string;
}

export interface StatementFormData {
  title: string;
  date: Date;
  previousBalance: number;
}

export type LineDirection = "INCOME" | "EXPENSE";

export interface StatementLine {
  id: string;
  statementId: string;
  direction: LineDirection;
  category: string;
  amount: number;
  isPaid: boolean;
  description: string;
  relatedExpenseId?: string;
  partnerId?: string;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StatementLineFormData {
  direction: LineDirection;
  category: string;
  amount: number;
  isPaid: boolean;
  description: string;
  relatedExpenseId?: string;
  partnerId?: string;
}

// Partner Types
export interface Partner {
  id: string;
  name: string;
  sharePercentage: number;
  baseSalary: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

export type PartnerStatementStatus = "DRAFT" | "CLOSED";

export interface PartnerStatement {
  id: string;
  partnerId: string;
  month: number;
  year: number;
  status: PartnerStatementStatus;
  previousBalance: number;
  personalExpenseReimbursement: number;
  monthlySalary: number;
  profitShare: number;
  actualWithdrawn: number;
  nextMonthBalance: number;
  note?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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

// Network Types
export type NetworkCategory = "YENI_INSA" | "TAMIR" | "YAT" | "ASKERI_PROJE" | "TANKER" | "DIGER";
export type ServiceArea = "BORU" | "BORU_TECHIZ" | "DIGER";
export type ContactStatus = "ULASILDI" | "ULASILMIYOR" | "BEKLEMEDE";
export type QuoteStatus = "HAYIR" | "TEKLIF_BEKLENIYOR" | "TEKLIF_VERILDI" | "TEKLIF_VERILECEK" | "GORUSME_DEVAM_EDIYOR";
export type ResultStatus = "BEKLEMEDE" | "KAZANILDI" | "RED" | "IS_YOK" | "DONUS_YOK";

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
  result?: ResultStatus;
  lastContactDate?: Timestamp;
  nextActionDate?: Timestamp;
  quoteDate?: Timestamp;
  notes?: string;
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
  result?: ResultStatus;
  lastContactDate?: Date;
  nextActionDate?: Date;
  quoteDate?: Date;
  notes?: string;
}

// Company Overview
export interface CompanyOverview {
  id: string;
  companySafeBalance: number;
  currency: string;
  lastUpdatedAt: Timestamp;
  updatedByUserId?: string;
}

// Dashboard Types
export interface DashboardSummary {
  companySafeBalance: number;
  totalPendingInShipyards: number;
  thisMonthExpenses: number;
  partnerNetBalances: { name: string; balance: number }[];
}

export interface ExpenseTrendItem {
  month: string;
  total: number;
}

export interface StatementTrendItem {
  month: string;
  netCash: number;
}

// Label helpers
export const getCategoryLabel = (category: NetworkCategory): string => {
  const labels: Record<NetworkCategory, string> = {
    YENI_INSA: "Yeni İnşa",
    TAMIR: "Tamir",
    YAT: "Yat",
    ASKERI_PROJE: "Askeri Proje",
    TANKER: "Tanker",
    DIGER: "Diğer"
  };
  return labels[category] || category;
};

export const getServiceAreaLabel = (area: ServiceArea): string => {
  const labels: Record<ServiceArea, string> = {
    BORU: "Boru",
    BORU_TECHIZ: "Boru + Teçhiz",
    DIGER: "Diğer"
  };
  return labels[area] || area;
};

export const getContactStatusLabel = (status: ContactStatus): string => {
  const labels: Record<ContactStatus, string> = {
    ULASILDI: "Ulaşıldı",
    ULASILMIYOR: "Ulaşılamıyor",
    BEKLEMEDE: "Beklemede"
  };
  return labels[status] || status;
};

export const getQuoteStatusLabel = (status: QuoteStatus): string => {
  const labels: Record<QuoteStatus, string> = {
    HAYIR: "Hayır",
    TEKLIF_BEKLENIYOR: "Teklif Bekleniyor",
    TEKLIF_VERILDI: "Teklif Verildi",
    TEKLIF_VERILECEK: "Teklif Verilecek",
    GORUSME_DEVAM_EDIYOR: "Görüşme Devam Ediyor"
  };
  return labels[status] || status;
};

export const getResultStatusLabel = (status: ResultStatus): string => {
  const labels: Record<ResultStatus, string> = {
    BEKLEMEDE: "Beklemede",
    KAZANILDI: "Kazanıldı",
    RED: "Red",
    IS_YOK: "İş Yok",
    DONUS_YOK: "Dönüş Yok"
  };
  return labels[status] || status;
};

export const getExpenseTypeLabel = (type: ExpenseType): string => {
  const labels: Record<ExpenseType, string> = {
    COMPANY_OFFICIAL: "Şirket Resmi",
    PERSONAL: "Kişisel",
    ADVANCE: "Avans"
  };
  return labels[type] || type;
};

export const getExpenseStatusLabel = (status: ExpenseStatus): string => {
  const labels: Record<ExpenseStatus, string> = {
    PAID: "Ödendi",
    UNPAID: "Ödenmedi"
  };
  return labels[status] || status;
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    TRY: "₺",
    EUR: "€",
    USD: "$"
  };
  return symbols[currency] || currency;
};
