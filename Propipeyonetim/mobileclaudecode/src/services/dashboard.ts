import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  DashboardSummary,
  Expense,
  Project,
  ProjectStatement,
  Partner,
  NetworkContact,
  CompanyOverview,
} from '../types';

// ==================== HELPERS ====================

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const safeToDate = (timestamp: Timestamp | null | undefined): Date | null => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return null;
  }
  try {
    return timestamp.toDate();
  } catch {
    return null;
  }
};

const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// ==================== COMPANY OVERVIEW ====================

export const getCompanyOverview = async (): Promise<CompanyOverview> => {
  try {
    const docRef = doc(db, 'company_overview', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CompanyOverview;
    }

    // Default values
    return {
      id: 'main',
      companySafeBalance: 0,
      currency: 'TRY',
      lastUpdatedAt: null,
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return {
      id: 'main',
      companySafeBalance: 0,
      currency: 'TRY',
      lastUpdatedAt: null,
    };
  }
};

// ==================== DASHBOARD SUMMARY ====================

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const [
    companyOverview,
    projectsBalance,
    paidExpenses,
    partnersData,
  ] = await Promise.all([
    getCompanyOverview(),
    getTotalProjectsBalance(),
    getPaidExpensesThisMonth(),
    getPartnersBalanceSummary(),
  ]);

  return {
    companySafeBalance: companyOverview.companySafeBalance,
    currency: companyOverview.currency,
    lastUpdatedAt: companyOverview.lastUpdatedAt,
    totalProjectsBalance: projectsBalance.total,
    totalProjectsCount: projectsBalance.count,
    totalPaidExpensesThisMonth: paidExpenses,
    totalPartnersPositive: partnersData.positive,
    totalPartnersNegative: partnersData.negative,
  };
};

const getTotalProjectsBalance = async (): Promise<{ total: number; count: number }> => {
  const projectsRef = collection(db, 'projects');
  const snapshot = await getDocs(projectsRef);

  let total = 0;
  let count = 0;

  snapshot.forEach((doc) => {
    const data = doc.data() as Project;
    if (data.currentBalance !== undefined) {
      total += data.currentBalance;
      count++;
    }
  });

  return { total, count };
};

const getPaidExpensesThisMonth = async (): Promise<number> => {
  const now = new Date();
  const { start, end } = getMonthRange(now.getFullYear(), now.getMonth());

  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('status', '==', 'PAID'));

  const snapshot = await getDocs(q);
  let total = 0;

  snapshot.forEach((doc) => {
    const data = doc.data() as Expense;
    if (!data.isDeleted && data.date) {
      const expenseDate = safeToDate(data.date);
      if (expenseDate && expenseDate >= start && expenseDate <= end) {
        total += data.amount || 0;
      }
    }
  });

  return total;
};

const getPartnersBalanceSummary = async (): Promise<{ positive: number; negative: number }> => {
  const partnersRef = collection(db, 'partners');
  const snapshot = await getDocs(partnersRef);

  let positive = 0;
  let negative = 0;

  snapshot.forEach((doc) => {
    const data = doc.data() as Partner;
    if (data.isActive !== false) {
      const balance = data.currentBalance || 0;
      if (balance > 0) {
        positive += balance;
      } else if (balance < 0) {
        negative += Math.abs(balance);
      }
    }
  });

  return { positive, negative };
};

// ==================== TREND DATA ====================

export interface MonthlyTrendItem {
  monthLabel: string;
  monthKey: string;
  total: number;
}

const getLastNMonthsRanges = (n: number): { year: number; month: number; label: string; key: string }[] => {
  const result: { year: number; month: number; label: string; key: string }[] = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    result.push({
      year,
      month,
      label: MONTH_NAMES_TR[month],
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
    });
  }

  return result;
};

const timestampToMonthKey = (timestamp: Timestamp | null | undefined): string | null => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    return null;
  }
  try {
    const date = timestamp.toDate();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  } catch {
    return null;
  }
};

export const getLast6MonthsExpensesTrend = async (): Promise<MonthlyTrendItem[]> => {
  const months = getLastNMonthsRanges(6);

  const firstMonth = months[0];
  const lastMonth = months[months.length - 1];
  const startDate = new Date(firstMonth.year, firstMonth.month, 1);
  const endDate = new Date(lastMonth.year, lastMonth.month + 1, 0, 23, 59, 59);

  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, where('status', '==', 'PAID'));

  const snapshot = await getDocs(q);

  const monthlyTotals: Record<string, number> = {};
  months.forEach(m => {
    monthlyTotals[m.key] = 0;
  });

  snapshot.forEach((doc) => {
    const data = doc.data() as Expense;
    if (!data.isDeleted && data.date) {
      const expenseDate = safeToDate(data.date);
      if (expenseDate && expenseDate >= startDate && expenseDate <= endDate) {
        const monthKey = timestampToMonthKey(data.date);
        if (monthKey && monthlyTotals[monthKey] !== undefined) {
          monthlyTotals[monthKey] += data.amount || 0;
        }
      }
    }
  });

  return months.map(m => ({
    monthLabel: m.label,
    monthKey: m.key,
    total: monthlyTotals[m.key],
  }));
};

// ==================== LATEST ITEMS ====================

export const getLatestExpenses = async (limitCount: number = 5): Promise<Expense[]> => {
  const expensesRef = collection(db, 'expenses');
  const q = query(expensesRef, orderBy('date', 'desc'), limit(limitCount * 2));

  const snapshot = await getDocs(q);
  const results: Expense[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data() as Expense;
    if (!data.isDeleted && results.length < limitCount) {
      results.push({ ...data, id: doc.id } as Expense);
    }
  });

  return results;
};

export interface NetworkActionItem {
  id: string;
  companyName: string;
  contactPerson: string;
  phone?: string;
  category: string;
  quoteStatus: string;
  result?: string;
  nextActionDate?: Timestamp;
  isOverdue: boolean;
}

export const getUpcomingNetworkActions = async (): Promise<NetworkActionItem[]> => {
  const networkRef = collection(db, 'network_contacts');
  const snapshot = await getDocs(networkRef);

  const results: NetworkActionItem[] = [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  snapshot.forEach((doc) => {
    const data = doc.data() as NetworkContact;

    if (data.isDeleted) return;
    if (data.result === 'RED' || data.result === 'IS_YOK' || data.result === 'DONUS_YOK') return;

    if (data.nextActionDate) {
      const actionDate = safeToDate(data.nextActionDate);
      if (!actionDate) return;

      const isOverdue = actionDate < todayStart;
      const isWithinWeek = actionDate <= nextWeek;

      if (isWithinWeek) {
        results.push({
          id: doc.id,
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          category: data.category,
          quoteStatus: data.quoteStatus,
          result: data.result,
          nextActionDate: data.nextActionDate,
          isOverdue,
        });
      }
    }
  });

  // Sort: overdue first, then by date
  results.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    const dateA = safeToDate(a.nextActionDate)?.getTime() || 0;
    const dateB = safeToDate(b.nextActionDate)?.getTime() || 0;
    return dateA - dateB;
  });

  return results.slice(0, 10);
};

// ==================== LABELS ====================

export const getExpenseTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    COMPANY_OFFICIAL: 'Şirket Resmi',
    PERSONAL: 'Kişisel',
    ADVANCE: 'Avans',
  };
  return labels[type] || type;
};

export const getExpenseStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PAID: 'Ödendi',
    UNPAID: 'Ödenmedi',
  };
  return labels[status] || status;
};

export const getQuoteStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    HAYIR: 'Teklif Yok',
    TEKLIF_BEKLENIYOR: 'Teklif Bekleniyor',
    TEKLIF_VERILDI: 'Teklif Verildi',
    TEKLIF_VERILECEK: 'Teklif Verilecek',
    GORUSME_DEVAM_EDIYOR: 'Görüşme Devam Ediyor',
  };
  return labels[status] || status;
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    YENI_INSA: 'Yeni İnşa',
    TAMIR: 'Tamir',
    YAT: 'Yat',
    ASKERI_PROJE: 'Askeri Proje',
    TANKER: 'Tanker',
    DIGER: 'Diğer',
  };
  return labels[category] || category;
};

export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    NAKIT: 'Nakit',
    HAVALE: 'Havale',
    KREDI_KARTI: 'Kredi Kartı',
    CEK: 'Çek',
  };
  return labels[method] || method;
};

export const getContactStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ILK_TEMAS: 'İlk Temas',
    TEKLIF_ASAMASI: 'Teklif Aşaması',
    GORUSME_DEVAM: 'Görüşme Devam',
    KAPALI: 'Kapalı',
  };
  return labels[status] || status;
};

export const getResultLabel = (result: string): string => {
  const labels: Record<string, string> = {
    IS_ALINDI: 'İş Alındı',
    RED: 'Red',
    IS_YOK: 'İş Yok',
    DEVAM_EDIYOR: 'Devam Ediyor',
    DONUS_YOK: 'Dönüş Yok',
  };
  return labels[result] || result;
};
