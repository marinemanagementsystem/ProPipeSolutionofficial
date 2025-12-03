import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type {
  CompanyOverview,
  Expense,
  NetworkAction,
  Partner,
  Project,
} from "../types";

export interface DashboardSummary {
  companySafeBalance: number;
  currency: string;
  lastUpdatedAt?: Timestamp | null;
  totalProjectsBalance: number;
  totalProjectsCount: number;
  totalPaidExpensesThisMonth: number;
  totalPartnersPositive: number;
  totalPartnersNegative: number;
}

const DEFAULT_OVERVIEW: CompanyOverview = {
  companySafeBalance: 0,
  currency: "TRY",
  lastUpdatedAt: null,
};

export const fetchCompanyOverview = async (): Promise<CompanyOverview> => {
  const docRef = doc(db, "company_overview", "main");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...(snap.data() as CompanyOverview) };
  }
  return DEFAULT_OVERVIEW;
};

export const fetchProjects = async (): Promise<Project[]> => {
  const q = query(collection(db, "projects"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (projectDoc) =>
      ({
        id: projectDoc.id,
        ...(projectDoc.data() as Omit<Project, "id">),
      } as Project)
  );
};

const getPaidExpensesThisMonth = async (): Promise<number> => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const expensesRef = collection(db, "expenses");
  const q = query(expensesRef, where("status", "==", "PAID"));
  const snapshot = await getDocs(q);

  let total = 0;
  snapshot.forEach((expenseDoc) => {
    const data = expenseDoc.data() as Expense;
    if (!data.isDeleted && data.date) {
      const expenseDate = data.date.toDate();
      if (expenseDate >= start && expenseDate <= end) {
        total += data.amount || 0;
      }
    }
  });

  return total;
};

const getPartnersBalanceSummary = async (): Promise<{
  positive: number;
  negative: number;
}> => {
  const partnersRef = collection(db, "partners");
  const snapshot = await getDocs(partnersRef);

  let positive = 0;
  let negative = 0;

  snapshot.forEach((partnerDoc) => {
    const data = partnerDoc.data() as Partner;
    if (data.isActive === false) return;
    const balance = data.currentBalance || 0;
    if (balance > 0) positive += balance;
    if (balance < 0) negative += Math.abs(balance);
  });

  return { positive, negative };
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const [overview, projects, expensesThisMonth, partnerBalances] =
    await Promise.all([
      fetchCompanyOverview(),
      fetchProjects(),
      getPaidExpensesThisMonth(),
      getPartnersBalanceSummary(),
    ]);

  const totalProjectsBalance = projects.reduce(
    (sum, p) => sum + (p.currentBalance || 0),
    0
  );

  return {
    companySafeBalance: overview.companySafeBalance,
    currency: overview.currency,
    lastUpdatedAt: overview.lastUpdatedAt,
    totalProjectsBalance,
    totalProjectsCount: projects.length,
    totalPaidExpensesThisMonth: expensesThisMonth,
    totalPartnersPositive: partnerBalances.positive,
    totalPartnersNegative: partnerBalances.negative,
  };
};

export const fetchLatestExpenses = async (
  limitCount: number = 5
): Promise<Expense[]> => {
  const expensesRef = collection(db, "expenses");
  const q = query(expensesRef, orderBy("date", "desc"), limit(limitCount * 2));

  const snapshot = await getDocs(q);
  const results: Expense[] = [];
  snapshot.forEach((expenseDoc) => {
    const data = expenseDoc.data() as Expense;
    if (!data.isDeleted && results.length < limitCount) {
      results.push({ ...data, id: expenseDoc.id });
    }
  });

  return results;
};

export const fetchUpcomingNetworkActions = async (): Promise<
  NetworkAction[]
> => {
  const networkRef = collection(db, "network");
  const snapshot = await getDocs(networkRef);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  const results: NetworkAction[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as NetworkAction;
    if ((data as any).isDeleted) return;
    const nextActionDate = data.nextActionDate?.toDate();
    if (!nextActionDate) return;

    const isOverdue = nextActionDate < todayStart;
    const isWithinWeek = nextActionDate <= nextWeek;

    if (isWithinWeek) {
      results.push({
        ...data,
        id: docSnap.id,
        isOverdue,
      });
    }
  });

  results.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    const timeA = a.nextActionDate?.toDate().getTime() || 0;
    const timeB = b.nextActionDate?.toDate().getTime() || 0;
    return timeA - timeB;
  });

  return results.slice(0, 10);
};
