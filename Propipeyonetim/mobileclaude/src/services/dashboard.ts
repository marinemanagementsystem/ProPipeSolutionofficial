import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  DashboardSummary,
  ExpenseTrendItem,
  StatementTrendItem,
  Expense,
  NetworkContact,
  ProjectStatement
} from "../types";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { tr } from "date-fns/locale";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  try {
    // Get company safe balance
    const overviewDoc = await getDoc(doc(db, "companyOverview", "main"));
    const companySafeBalance = overviewDoc.exists() ? overviewDoc.data().companySafeBalance || 0 : 0;

    // Get total pending in shipyards (project balances)
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    let totalPendingInShipyards = 0;
    projectsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.currentBalance > 0) {
        totalPendingInShipyards += data.currentBalance;
      }
    });

    // Get this month's expenses
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const expensesQuery = query(
      collection(db, "expenses"),
      where("date", ">=", Timestamp.fromDate(monthStart)),
      where("date", "<=", Timestamp.fromDate(monthEnd)),
      where("status", "==", "PAID")
    );
    const expensesSnapshot = await getDocs(expensesQuery);
    let thisMonthExpenses = 0;
    expensesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        thisMonthExpenses += data.amount || 0;
      }
    });

    // Get partner balances
    const partnersSnapshot = await getDocs(collection(db, "partners"));
    const partnerNetBalances: { name: string; balance: number }[] = [];
    partnersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false) {
        partnerNetBalances.push({
          name: data.name,
          balance: data.currentBalance || 0
        });
      }
    });

    return {
      companySafeBalance,
      totalPendingInShipyards,
      thisMonthExpenses,
      partnerNetBalances
    };
  } catch (error) {
    console.error("Dashboard özeti alınamadı:", error);
    throw error;
  }
};

export const getLast6MonthsExpensesTrend = async (): Promise<ExpenseTrendItem[]> => {
  try {
    const now = new Date();
    const result: ExpenseTrendItem[] = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);

      const expensesQuery = query(
        collection(db, "expenses"),
        where("date", ">=", Timestamp.fromDate(monthStart)),
        where("date", "<=", Timestamp.fromDate(monthEnd)),
        where("status", "==", "PAID")
      );

      const snapshot = await getDocs(expensesQuery);
      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isDeleted) {
          total += data.amount || 0;
        }
      });

      result.push({
        month: format(targetMonth, "MMM", { locale: tr }),
        total
      });
    }

    return result;
  } catch (error) {
    console.error("Gider trendi alınamadı:", error);
    throw error;
  }
};

export const getLast6MonthsStatementsTrend = async (): Promise<StatementTrendItem[]> => {
  try {
    const now = new Date();
    const result: StatementTrendItem[] = [];

    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);

      // Get all projects
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      let totalNetCash = 0;

      for (const projectDoc of projectsSnapshot.docs) {
        const statementsQuery = query(
          collection(db, "projects", projectDoc.id, "project_statements"),
          where("status", "==", "CLOSED"),
          where("date", ">=", Timestamp.fromDate(monthStart)),
          where("date", "<=", Timestamp.fromDate(monthEnd))
        );

        const statementsSnapshot = await getDocs(statementsQuery);
        statementsSnapshot.forEach((statementDoc) => {
          const data = statementDoc.data();
          if (data.totals?.netCashReal) {
            totalNetCash += data.totals.netCashReal;
          }
        });
      }

      result.push({
        month: format(targetMonth, "MMM", { locale: tr }),
        netCash: totalNetCash
      });
    }

    return result;
  } catch (error) {
    console.error("Hakediş trendi alınamadı:", error);
    throw error;
  }
};

export const getUpcomingNetworkActions = async (): Promise<NetworkContact[]> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const networkQuery = query(
      collection(db, "networkActions"),
      where("nextActionDate", ">=", Timestamp.fromDate(today)),
      where("nextActionDate", "<=", Timestamp.fromDate(nextWeek)),
      orderBy("nextActionDate", "asc"),
      limit(10)
    );

    const snapshot = await getDocs(networkQuery);
    const contacts: NetworkContact[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        contacts.push({
          id: doc.id,
          ...data
        } as NetworkContact);
      }
    });

    return contacts;
  } catch (error) {
    console.error("Yaklaşan aramalar alınamadı:", error);
    return [];
  }
};

export const getLatestExpenses = async (limitCount: number = 5): Promise<Expense[]> => {
  try {
    const expensesQuery = query(
      collection(db, "expenses"),
      orderBy("createdAt", "desc"),
      limit(limitCount * 2)
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses: Expense[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted && expenses.length < limitCount) {
        expenses.push({
          id: doc.id,
          ...data
        } as Expense);
      }
    });

    return expenses;
  } catch (error) {
    console.error("Son giderler alınamadı:", error);
    return [];
  }
};

export const getLatestClosedStatements = async (limitCount: number = 5): Promise<(ProjectStatement & { projectName: string })[]> => {
  try {
    const projectsSnapshot = await getDocs(collection(db, "projects"));
    const allStatements: (ProjectStatement & { projectName: string })[] = [];

    for (const projectDoc of projectsSnapshot.docs) {
      const projectData = projectDoc.data();

      const statementsQuery = query(
        collection(db, "projects", projectDoc.id, "project_statements"),
        where("status", "==", "CLOSED"),
        orderBy("updatedAt", "desc"),
        limit(limitCount)
      );

      const statementsSnapshot = await getDocs(statementsQuery);

      statementsSnapshot.forEach((statementDoc) => {
        allStatements.push({
          id: statementDoc.id,
          projectName: projectData.name,
          ...statementDoc.data()
        } as ProjectStatement & { projectName: string });
      });
    }

    // Sort by updatedAt and return limited results
    return allStatements
      .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())
      .slice(0, limitCount);
  } catch (error) {
    console.error("Son hakediş kapanışları alınamadı:", error);
    return [];
  }
};
