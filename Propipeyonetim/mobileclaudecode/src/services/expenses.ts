import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Expense, ExpenseFormData } from '../types';

const EXPENSES_COLLECTION = 'expenses';

// Timestamp'i güvenli bir şekilde Date'e çevir
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

// Get all expenses with filters
export const getExpenses = async (
  startDate?: Date | null,
  endDate?: Date | null,
  type?: string,
  status?: string,
  showDeleted: boolean = false
): Promise<Expense[]> => {
  try {
    const q = query(collection(db, EXPENSES_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    let expenses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Expense));

    // Soft delete filtresi
    if (showDeleted) {
      expenses = expenses.filter(e => e.isDeleted === true);
    } else {
      expenses = expenses.filter(e => !e.isDeleted);
    }

    // Tarih filtresi
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      expenses = expenses.filter(e => {
        const expenseDate = safeToDate(e.date);
        return expenseDate && expenseDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      expenses = expenses.filter(e => {
        const expenseDate = safeToDate(e.date);
        return expenseDate && expenseDate <= end;
      });
    }

    // Tür filtresi
    if (type && type !== 'ALL') {
      expenses = expenses.filter(e => e.type === type);
    }

    // Durum filtresi
    if (status && status !== 'ALL') {
      expenses = expenses.filter(e => e.status === status);
    }

    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Create expense
export const createExpense = async (
  data: ExpenseFormData,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<string> => {
  try {
    let receiptUrl = '';

    if (data.receiptFile) {
      receiptUrl = await uploadReceipt(data.receiptFile);
    }

    const expenseData: Omit<Expense, 'id'> = {
      amount: Number(data.amount),
      description: data.description,
      date: Timestamp.fromDate(data.date),
      type: data.type,
      status: data.status,
      ownerId: data.ownerId,
      currency: data.currency,
      paymentMethod: data.paymentMethod,
      projectId: data.projectId,
      category: data.category,
      receiptUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user?.uid,
      createdByEmail: user?.email || undefined,
      createdByDisplayName: user?.displayName || undefined,
      isDeleted: false,
    };

    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expenseData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

// Update expense
export const updateExpense = async (
  id: string,
  data: Partial<ExpenseFormData>,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, id);

    const updates: any = {
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid,
      updatedByEmail: user?.email,
      updatedByDisplayName: user?.displayName,
    };

    if (data.amount !== undefined) updates.amount = Number(data.amount);
    if (data.description !== undefined) updates.description = data.description;
    if (data.date !== undefined) updates.date = Timestamp.fromDate(data.date);
    if (data.type !== undefined) updates.type = data.type;
    if (data.status !== undefined) updates.status = data.status;
    if (data.ownerId !== undefined) updates.ownerId = data.ownerId;
    if (data.currency !== undefined) updates.currency = data.currency;
    if (data.paymentMethod !== undefined) updates.paymentMethod = data.paymentMethod;
    if (data.projectId !== undefined) updates.projectId = data.projectId;
    if (data.category !== undefined) updates.category = data.category;

    if (data.receiptFile) {
      const receiptUrl = await uploadReceipt(data.receiptFile);
      updates.receiptUrl = receiptUrl;
    }

    await updateDoc(expenseRef, updates);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// Soft delete expense
export const deleteExpense = async (
  id: string,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, id);

    await updateDoc(expenseRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      deletedByUserId: user?.uid,
      deletedByEmail: user?.email,
      deletedByDisplayName: user?.displayName,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid,
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Upload receipt image
const uploadReceipt = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `receipts/${Date.now()}_receipt.jpg`;
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};

// Get expense by ID
export const getExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const docRef = doc(db, EXPENSES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Expense;
    }
    return null;
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};
