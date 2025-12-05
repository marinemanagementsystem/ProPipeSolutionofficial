import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Partner,
  PartnerStatement,
  PartnerFormData,
  PartnerStatementFormData,
  PartnerStatementHistoryEntry,
} from '../types';
import { calculateNextMonthBalance } from '../types';

// Collection references
const partnersCollection = collection(db, 'partners');
const partnerStatementsCollection = collection(db, 'partner_statements');

// ==================== HISTORY FUNCTIONS ====================

/**
 * Statement için history kaydı ekle (synchronized with web)
 */
export const addStatementHistory = async (
  statementId: string,
  partnerId: string,
  previousData: Partial<PartnerStatement>,
  changeType: PartnerStatementHistoryEntry['changeType'],
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    const historyCollection = collection(db, 'partner_statements', statementId, 'history');

    await addDoc(historyCollection, {
      statementId,
      partnerId,
      previousData,
      changeType,
      changedAt: serverTimestamp(),
      changedByUserId: user?.uid || 'system',
      changedByEmail: user?.email || '',
      changedByDisplayName: user?.displayName || '',
    });
  } catch (error) {
    console.error('Error adding statement history:', error);
    // History hatası ana işlemi durdurmamalı
  }
};

/**
 * Partner Statement'ın history kayıtlarını getir
 */
export const getPartnerStatementHistory = async (
  statementId: string
): Promise<PartnerStatementHistoryEntry[]> => {
  try {
    const historyCollection = collection(db, 'partner_statements', statementId, 'history');
    const q = query(historyCollection, orderBy('changedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as PartnerStatementHistoryEntry[];
  } catch (error) {
    console.error('getPartnerStatementHistory error:', error);
    return [];
  }
};

// Alias for backward compatibility
export const getStatementHistory = getPartnerStatementHistory;

// ==================== PARTNER (ORTAK) FUNCTIONS ====================

export const getPartners = async (): Promise<Partner[]> => {
  const q = query(partnersCollection, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Partner[];
};

export const getActivePartners = async (): Promise<Partner[]> => {
  const q = query(
    partnersCollection,
    where('isActive', '==', true),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Partner[];
};

export const getPartnerById = async (partnerId: string): Promise<Partner | null> => {
  const docRef = doc(db, 'partners', partnerId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Partner;
};

export const createPartner = async (
  data: PartnerFormData,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<string> => {
  const now = serverTimestamp();
  const docRef = await addDoc(partnersCollection, {
    name: data.name,
    sharePercentage: data.sharePercentage,
    baseSalary: data.baseSalary,
    currentBalance: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...(user && {
      createdBy: user.uid,
      createdByEmail: user.email,
      createdByDisplayName: user.displayName || '',
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });
  return docRef.id;
};

export const updatePartner = async (
  partnerId: string,
  updates: Partial<PartnerFormData>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  const docRef = doc(db, 'partners', partnerId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });
};

export const togglePartnerActive = async (
  partnerId: string,
  isActive: boolean,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  const docRef = doc(db, 'partners', partnerId);
  await updateDoc(docRef, {
    isActive,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });
};

/**
 * Ortak bakiyesini manuel güncelle (history ile birlikte)
 */
export const updatePartnerBalance = async (
  partnerId: string,
  newBalance: number,
  reason: string,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  const docRef = doc(db, 'partners', partnerId);

  const partner = await getPartnerById(partnerId);
  if (!partner) throw new Error('Ortak bulunamadı');

  const previousBalance = partner.currentBalance;

  await updateDoc(docRef, {
    currentBalance: newBalance,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });

  // Log balance adjustment
  const balanceAdjustmentsCollection = collection(db, 'partner_balance_adjustments');
  await addDoc(balanceAdjustmentsCollection, {
    partnerId,
    partnerName: partner.name,
    previousBalance,
    newBalance,
    difference: newBalance - previousBalance,
    reason,
    adjustedAt: serverTimestamp(),
    ...(user && {
      adjustedBy: user.uid,
      adjustedByEmail: user.email,
      adjustedByDisplayName: user.displayName || '',
    }),
  });
};

// ==================== PARTNER STATEMENT FUNCTIONS ====================

export const getPartnerStatements = async (partnerId: string): Promise<PartnerStatement[]> => {
  try {
    const q = query(
      partnerStatementsCollection,
      where('partnerId', '==', partnerId)
    );
    const snapshot = await getDocs(q);
    const statements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PartnerStatement[];

    // Client-side sorting: year desc, then month desc
    return statements.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  } catch (error) {
    console.error('getPartnerStatements error:', error);
    return [];
  }
};

export const getPartnerStatementById = async (
  statementId: string
): Promise<PartnerStatement | null> => {
  const docRef = doc(db, 'partner_statements', statementId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as PartnerStatement;
};

/**
 * Yeni statement oluştur (history ile birlikte - synchronized with web)
 */
export const createPartnerStatement = async (
  partnerId: string,
  data: PartnerStatementFormData,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<string> => {
  const nextMonthBalance = calculateNextMonthBalance(
    data.previousBalance,
    data.personalExpenseReimbursement,
    data.monthlySalary,
    data.profitShare,
    data.actualWithdrawn
  );

  const now = serverTimestamp();
  const docRef = await addDoc(partnerStatementsCollection, {
    partnerId,
    month: data.month,
    year: data.year,
    status: 'DRAFT',
    previousBalance: data.previousBalance,
    personalExpenseReimbursement: data.personalExpenseReimbursement,
    monthlySalary: data.monthlySalary,
    profitShare: data.profitShare,
    actualWithdrawn: data.actualWithdrawn,
    nextMonthBalance,
    note: data.note || '',
    createdAt: now,
    updatedAt: now,
    ...(user && {
      createdBy: user.uid,
      createdByEmail: user.email,
      createdByDisplayName: user.displayName || '',
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });

  // History kaydı ekle (CREATE) - synchronized with web
  const createdStatement = {
    id: docRef.id,
    partnerId,
    month: data.month,
    year: data.year,
    status: 'DRAFT' as const,
    previousBalance: data.previousBalance,
    personalExpenseReimbursement: data.personalExpenseReimbursement,
    monthlySalary: data.monthlySalary,
    profitShare: data.profitShare,
    actualWithdrawn: data.actualWithdrawn,
    nextMonthBalance,
    note: data.note || '',
  };
  await addStatementHistory(docRef.id, partnerId, createdStatement as PartnerStatement, 'CREATE', user);

  // Update partner balance
  const partnerRef = doc(db, 'partners', partnerId);
  await updateDoc(partnerRef, {
    currentBalance: nextMonthBalance,
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

/**
 * Statement güncelle (history ile birlikte - synchronized with web)
 */
export const updatePartnerStatement = async (
  statementId: string,
  updates: Partial<PartnerStatementFormData>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');

  // History kaydı ekle (UPDATE) - synchronized with web
  await addStatementHistory(statementId, statement.partnerId, statement, 'UPDATE', user);

  const previousBalance = updates.previousBalance ?? statement.previousBalance;
  const personalExpenseReimbursement =
    updates.personalExpenseReimbursement ?? statement.personalExpenseReimbursement;
  const monthlySalary = updates.monthlySalary ?? statement.monthlySalary;
  const profitShare = updates.profitShare ?? statement.profitShare;
  const actualWithdrawn = updates.actualWithdrawn ?? statement.actualWithdrawn;

  const nextMonthBalance = calculateNextMonthBalance(
    previousBalance,
    personalExpenseReimbursement,
    monthlySalary,
    profitShare,
    actualWithdrawn
  );

  const docRef = doc(db, 'partner_statements', statementId);
  await updateDoc(docRef, {
    ...updates,
    nextMonthBalance,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });

  // Update partner balance
  const partnerRef = doc(db, 'partners', statement.partnerId);
  await updateDoc(partnerRef, {
    currentBalance: nextMonthBalance,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Statement sil (sadece DRAFT)
 */
export const deletePartnerStatement = async (statementId: string): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');
  if (statement.status === 'CLOSED') throw new Error('Kapalı dönem silinemez');

  const docRef = doc(db, 'partner_statements', statementId);
  await deleteDoc(docRef);
};

/**
 * Statement'ın nextMonthBalance değerini yeniden hesapla
 */
export const recalculatePartnerStatement = async (
  statementId: string,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<number> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');

  const nextMonthBalance = calculateNextMonthBalance(
    statement.previousBalance,
    statement.personalExpenseReimbursement,
    statement.monthlySalary,
    statement.profitShare,
    statement.actualWithdrawn
  );

  const docRef = doc(db, 'partner_statements', statementId);
  await updateDoc(docRef, {
    nextMonthBalance,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });

  return nextMonthBalance;
};

/**
 * Dönemi kapat (history ile birlikte - synchronized with web)
 */
export const closePartnerStatement = async (
  statementId: string,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');
  if (statement.status === 'CLOSED') throw new Error('Bu dönem zaten kapalı');

  // History kaydı ekle (CLOSE) - synchronized with web
  await addStatementHistory(statementId, statement.partnerId, statement, 'CLOSE', user);

  const nextMonthBalance = calculateNextMonthBalance(
    statement.previousBalance,
    statement.personalExpenseReimbursement,
    statement.monthlySalary,
    statement.profitShare,
    statement.actualWithdrawn
  );

  const statementRef = doc(db, 'partner_statements', statementId);
  await updateDoc(statementRef, {
    status: 'CLOSED',
    nextMonthBalance,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });

  // Update partner balance
  const partnerRef = doc(db, 'partners', statement.partnerId);
  await updateDoc(partnerRef, {
    currentBalance: nextMonthBalance,
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });
};

/**
 * Dönemi yeniden aç (history ile birlikte - synchronized with web)
 */
export const reopenPartnerStatement = async (
  statementId: string,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');
  if (statement.status === 'DRAFT') throw new Error('Bu dönem zaten açık');

  // History kaydı ekle (REOPEN) - synchronized with web
  await addStatementHistory(statementId, statement.partnerId, statement, 'REOPEN', user);

  const statementRef = doc(db, 'partner_statements', statementId);
  await updateDoc(statementRef, {
    status: 'DRAFT',
    updatedAt: serverTimestamp(),
    ...(user && {
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName || '',
    }),
  });
};

/**
 * Yeni statement için önerilen previousBalance değerini al
 */
export const getSuggestedPreviousBalance = async (
  partnerId: string
): Promise<{ value: number; isEditable: boolean }> => {
  try {
    const allStatements = await getPartnerStatements(partnerId);

    if (allStatements.length === 0) {
      return { value: 0, isEditable: true };
    }

    const closedStatements = allStatements.filter(s => s.status === 'CLOSED');

    if (closedStatements.length > 0) {
      const lastClosed = closedStatements[0];
      return { value: lastClosed.nextMonthBalance, isEditable: false };
    }

    return { value: 0, isEditable: true };
  } catch (error) {
    console.error('getSuggestedPreviousBalance error:', error);
    return { value: 0, isEditable: true };
  }
};

/**
 * Bir ortağın son CLOSED statement'ını getir
 */
export const getLastClosedStatement = async (
  partnerId: string
): Promise<PartnerStatement | null> => {
  try {
    const q = query(
      partnerStatementsCollection,
      where('partnerId', '==', partnerId),
      where('status', '==', 'CLOSED'),
      orderBy('year', 'desc'),
      orderBy('month', 'desc'),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as PartnerStatement;
  } catch (error) {
    // Fallback: index olmayabilir, client-side filtrele
    console.warn('Falling back to client-side filter for getLastClosedStatement:', error);
    const allStatements = await getPartnerStatements(partnerId);
    const closedStatements = allStatements.filter(s => s.status === 'CLOSED');
    if (closedStatements.length === 0) return null;
    return closedStatements[0];
  }
};

/**
 * Belirli ay/yıl için mevcut statement var mı kontrol et
 */
export const checkStatementExists = async (
  partnerId: string,
  month: number,
  year: number
): Promise<boolean> => {
  const q = query(
    partnerStatementsCollection,
    where('partnerId', '==', partnerId),
    where('month', '==', month),
    where('year', '==', year)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
