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
import { db } from "../config/firebase";
import type {
  CompanyOverview,
  DashboardSummary,
  Expense,
  NetworkAction,
  Partner,
  Project,
} from "../types";

const DEFAULT_OVERVIEW: CompanyOverview = {
  companySafeBalance: 0,
  currency: "TRY",
  lastUpdatedAt: null,
};

export const fetchCompanyOverview = async (): Promise<CompanyOverview> => {
  try {
    const docRef = doc(db, "company_overview", "main");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as CompanyOverview) };
    }
    return DEFAULT_OVERVIEW;
  } catch (error) {
    console.error("Error fetching company overview:", error);
    return DEFAULT_OVERVIEW;
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  try {
    const q = query(collection(db, "projects"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (projectDoc) =>
        ({
          id: projectDoc.id,
          ...(projectDoc.data() as Omit<Project, "id">),
        } as Project)
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const fetchPartners = async (): Promise<Partner[]> => {
  try {
    const snapshot = await getDocs(collection(db, "partners"));
    return snapshot.docs.map(
      (partnerDoc) =>
        ({
          id: partnerDoc.id,
          ...(partnerDoc.data() as Omit<Partner, "id">),
        } as Partner)
    );
  } catch (error) {
    console.error("Error fetching partners:", error);
    return [];
  }
};

const getPaidExpensesThisMonth = async (): Promise<number> => {
  try {
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
  } catch (error) {
    console.error("Error fetching paid expenses:", error);
    return 0;
  }
};

const getPartnersBalanceSummary = async (): Promise<{
  positive: number;
  negative: number;
  count: number;
}> => {
  try {
    const partnersRef = collection(db, "partners");
    const snapshot = await getDocs(partnersRef);

    let positive = 0;
    let negative = 0;
    let count = 0;

    snapshot.forEach((partnerDoc) => {
      const data = partnerDoc.data() as Partner;
      if (data.isActive === false) return;
      count++;
      const balance = data.currentBalance || 0;
      if (balance > 0) positive += balance;
      if (balance < 0) negative += Math.abs(balance);
    });

    return { positive, negative, count };
  } catch (error) {
    console.error("Error fetching partner balances:", error);
    return { positive: 0, negative: 0, count: 0 };
  }
};

const getExpensesSummary = async (): Promise<{
  total: number;
  unpaid: number;
}> => {
  try {
    const snapshot = await getDocs(collection(db, "expenses"));
    let total = 0;
    let unpaid = 0;

    snapshot.forEach((expenseDoc) => {
      const data = expenseDoc.data() as Expense;
      if (!data.isDeleted) {
        total += data.amount || 0;
        if (data.status === "UNPAID") {
          unpaid += data.amount || 0;
        }
      }
    });

    return { total, unpaid };
  } catch (error) {
    console.error("Error fetching expenses summary:", error);
    return { total: 0, unpaid: 0 };
  }
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const [overview, projects, expensesThisMonth, partnerBalances, expensesSummary] =
    await Promise.all([
      fetchCompanyOverview(),
      fetchProjects(),
      getPaidExpensesThisMonth(),
      getPartnersBalanceSummary(),
      getExpensesSummary(),
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
    totalExpenses: expensesSummary.total,
    unpaidExpenses: expensesSummary.unpaid,
    totalPartners: partnerBalances.count,
  };
};

export const fetchLatestExpenses = async (
  limitCount: number = 5
): Promise<Expense[]> => {
  try {
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
  } catch (error) {
    console.error("Error fetching latest expenses:", error);
    return [];
  }
};

export const fetchUpcomingNetworkActions = async (): Promise<NetworkAction[]> => {
  try {
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

    return results.slice(0, 15);
  } catch (error) {
    console.error("Error fetching network actions:", error);
    return [];
  }
};

export const fetchAllNetworkActions = async (): Promise<NetworkAction[]> => {
  try {
    const networkRef = collection(db, "network");
    const snapshot = await getDocs(networkRef);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const results: NetworkAction[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as NetworkAction;
      if ((data as any).isDeleted) return;
      
      const nextActionDate = data.nextActionDate?.toDate();
      const isOverdue = nextActionDate ? nextActionDate < todayStart : false;

      results.push({
        ...data,
        id: docSnap.id,
        isOverdue,
      });
    });

    results.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      const timeA = a.nextActionDate?.toDate().getTime() || 0;
      const timeB = b.nextActionDate?.toDate().getTime() || 0;
      return timeA - timeB;
    });

    return results;
  } catch (error) {
    console.error("Error fetching all network actions:", error);
    return [];
  }
};
