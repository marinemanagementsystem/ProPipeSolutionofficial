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
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Partner,
  PartnerStatement,
  PartnerFormData,
  PartnerStatementFormData,
  calculateNextMonthBalance,
} from '../types';

// Collection references
const partnersCollection = collection(db, 'partners');
const partnerStatementsCollection = collection(db, 'partner_statements');

// ==================== PARTNER Functions ====================

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
  user?: { uid: string; email: string; displayName?: string }
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
    }),
  });
  return docRef.id;
};

export const updatePartner = async (
  partnerId: string,
  updates: Partial<PartnerFormData>,
  user?: { uid: string; email: string; displayName?: string }
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
  user?: { uid: string; email: string; displayName?: string }
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

export const updatePartnerBalance = async (
  partnerId: string,
  newBalance: number,
  reason: string,
  user?: { uid: string; email: string; displayName?: string }
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

// ==================== PARTNER STATEMENT Functions ====================

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

// Helper function for balance calculation
const calculateBalance = (
  previousBalance: number,
  personalExpenseReimbursement: number,
  monthlySalary: number,
  profitShare: number,
  actualWithdrawn: number
): number => {
  const hakEdis = personalExpenseReimbursement + monthlySalary + profitShare;
  return previousBalance + actualWithdrawn - hakEdis;
};

export const createPartnerStatement = async (
  partnerId: string,
  data: PartnerStatementFormData,
  user?: { uid: string; email: string; displayName?: string }
): Promise<string> => {
  const nextMonthBalance = calculateBalance(
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
    }),
  });

  // Update partner balance
  const partnerRef = doc(db, 'partners', partnerId);
  await updateDoc(partnerRef, {
    currentBalance: nextMonthBalance,
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const updatePartnerStatement = async (
  statementId: string,
  updates: Partial<PartnerStatementFormData>,
  user?: { uid: string; email: string; displayName?: string }
): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');

  const previousBalance = updates.previousBalance ?? statement.previousBalance;
  const personalExpenseReimbursement =
    updates.personalExpenseReimbursement ?? statement.personalExpenseReimbursement;
  const monthlySalary = updates.monthlySalary ?? statement.monthlySalary;
  const profitShare = updates.profitShare ?? statement.profitShare;
  const actualWithdrawn = updates.actualWithdrawn ?? statement.actualWithdrawn;

  const nextMonthBalance = calculateBalance(
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

export const deletePartnerStatement = async (statementId: string): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');
  if (statement.status === 'CLOSED') throw new Error('Kapalı dönem silinemez');

  const docRef = doc(db, 'partner_statements', statementId);
  await deleteDoc(docRef);
};

export const closePartnerStatement = async (
  statementId: string,
  user?: { uid: string; email: string; displayName?: string }
): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');
  if (statement.status === 'CLOSED') throw new Error('Bu dönem zaten kapalı');

  const nextMonthBalance = calculateBalance(
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
  });
};

export const reopenPartnerStatement = async (
  statementId: string,
  user?: { uid: string; email: string; displayName?: string }
): Promise<void> => {
  const statement = await getPartnerStatementById(statementId);
  if (!statement) throw new Error('Statement bulunamadı');
  if (statement.status === 'DRAFT') throw new Error('Bu dönem zaten açık');

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
