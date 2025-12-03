import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Expense, ExpenseFormData, ExpenseType, ExpenseStatus, UserProfile } from "../types";

interface GetExpensesParams {
  startDate?: Date;
  endDate?: Date;
  type?: ExpenseType;
  status?: ExpenseStatus;
  showDeleted?: boolean;
}

export const getExpenses = async (params: GetExpensesParams = {}): Promise<Expense[]> => {
  try {
    const { startDate, endDate, type, status, showDeleted = false } = params;

    let expensesQuery = query(
      collection(db, "expenses"),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(expensesQuery);
    let expenses: Expense[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      expenses.push({
        id: doc.id,
        ...data
      } as Expense);
    });

    // Client-side filtering
    if (!showDeleted) {
      expenses = expenses.filter(e => !e.isDeleted);
    }

    if (startDate) {
      expenses = expenses.filter(e => e.date.toDate() >= startDate);
    }

    if (endDate) {
      expenses = expenses.filter(e => e.date.toDate() <= endDate);
    }

    if (type) {
      expenses = expenses.filter(e => e.type === type);
    }

    if (status) {
      expenses = expenses.filter(e => e.status === status);
    }

    return expenses;
  } catch (error) {
    console.error("Giderler alınamadı:", error);
    throw error;
  }
};

export const getExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const docRef = doc(db, "expenses", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Expense;
    }

    return null;
  } catch (error) {
    console.error("Gider alınamadı:", error);
    throw error;
  }
};

export const createExpense = async (
  data: ExpenseFormData,
  user: UserProfile
): Promise<string> => {
  try {
    const now = Timestamp.now();

    const expenseData = {
      amount: data.amount,
      description: data.description,
      date: Timestamp.fromDate(data.date),
      type: data.type,
      status: data.status,
      ownerId: data.ownerId,
      currency: data.currency,
      paymentMethod: data.paymentMethod || null,
      projectId: data.projectId || null,
      category: data.category || null,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      createdByEmail: user.email,
      createdByDisplayName: user.displayName,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName,
      isDeleted: false
    };

    const docRef = await addDoc(collection(db, "expenses"), expenseData);
    return docRef.id;
  } catch (error) {
    console.error("Gider oluşturulamadı:", error);
    throw error;
  }
};

export const updateExpense = async (
  id: string,
  data: Partial<ExpenseFormData>,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "expenses", id);
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = Timestamp.fromDate(data.date);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    if (data.category !== undefined) updateData.category = data.category;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Gider güncellenemedi:", error);
    throw error;
  }
};

export const deleteExpense = async (
  id: string,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "expenses", id);
    const now = Timestamp.now();

    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: now,
      deletedByUserId: user.id,
      deletedByEmail: user.email,
      deletedByDisplayName: user.displayName,
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    });
  } catch (error) {
    console.error("Gider silinemedi:", error);
    throw error;
  }
};

export const restoreExpense = async (
  id: string,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "expenses", id);
    const now = Timestamp.now();

    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      deletedByUserId: null,
      deletedByEmail: null,
      deletedByDisplayName: null,
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    });
  } catch (error) {
    console.error("Gider geri alınamadı:", error);
    throw error;
  }
};

export const hardDeleteExpense = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "expenses", id));
  } catch (error) {
    console.error("Gider kalıcı olarak silinemedi:", error);
    throw error;
  }
};

export const getExpensesByOwner = async (ownerId: string): Promise<Expense[]> => {
  try {
    const expensesQuery = query(
      collection(db, "expenses"),
      where("ownerId", "==", ownerId),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(expensesQuery);
    const expenses: Expense[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.isDeleted) {
        expenses.push({
          id: doc.id,
          ...data
        } as Expense);
      }
    });

    return expenses;
  } catch (error) {
    console.error("Kullanıcı giderleri alınamadı:", error);
    throw error;
  }
};
