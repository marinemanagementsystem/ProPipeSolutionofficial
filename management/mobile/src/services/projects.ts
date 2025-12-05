import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Project, ProjectStatement, StatementLine, ProjectHistoryEntry, StatementHistoryEntry } from '../types';

const PROJECTS_COLLECTION = 'projects';
const STATEMENTS_COLLECTION = 'project_statements';
const LINES_SUBCOLLECTION = 'statement_lines';

// ==================== HISTORY FUNCTIONS ====================

// Add history entry for project changes
export const addProjectHistoryEntry = async (
  projectId: string,
  previousData: Project,
  user: { uid: string; email?: string | null; displayName?: string | null },
  changeType: 'UPDATE' | 'DELETE' | 'REVERT'
): Promise<void> => {
  try {
    const historyRef = collection(db, PROJECTS_COLLECTION, projectId, 'history');
    await addDoc(historyRef, {
      projectId,
      previousData,
      changedAt: Timestamp.now(),
      changedByUserId: user.uid,
      changedByEmail: user.email || null,
      changedByDisplayName: user.displayName || null,
      changeType,
    });
  } catch (error) {
    console.error('Error adding project history entry:', error);
    // History hatası ana işlemi durdurmamalı
  }
};

// Get project history
export const getProjectHistory = async (projectId: string): Promise<ProjectHistoryEntry[]> => {
  try {
    const historyRef = collection(db, PROJECTS_COLLECTION, projectId, 'history');
    const q = query(historyRef, orderBy('changedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as ProjectHistoryEntry));
  } catch (error) {
    console.error('Error fetching project history:', error);
    return [];
  }
};

// Add history entry for statement changes (synchronized with web)
export const addStatementHistoryEntry = async (
  statementId: string,
  previousData: ProjectStatement | StatementLine | null,
  user: { uid: string; email?: string | null; displayName?: string | null },
  changeType: StatementHistoryEntry['changeType'],
  lineInfo?: {
    lineId?: string;
    description?: string;
    amount?: number;
    direction?: 'INCOME' | 'EXPENSE';
    newData?: StatementLine;
  }
): Promise<void> => {
  try {
    const historyRef = collection(db, STATEMENTS_COLLECTION, statementId, 'history');

    const historyData: Record<string, unknown> = {
      statementId,
      changedAt: Timestamp.now(),
      changedByUserId: user.uid,
      changeType,
    };

    if (previousData) historyData.previousData = previousData;
    if (user.email) historyData.changedByEmail = user.email;
    if (user.displayName) historyData.changedByDisplayName = user.displayName;
    if (lineInfo?.lineId) historyData.lineId = lineInfo.lineId;
    if (lineInfo?.description) historyData.lineDescription = lineInfo.description;
    if (lineInfo?.amount !== undefined) historyData.lineAmount = lineInfo.amount;
    if (lineInfo?.direction) historyData.lineDirection = lineInfo.direction;
    if (lineInfo?.newData) historyData.newData = lineInfo.newData;

    await addDoc(historyRef, historyData);
  } catch (error) {
    console.error('Error adding statement history entry:', error);
    // History hatası ana işlemi durdurmamalı
  }
};

// Get statement history
export const getStatementHistory = async (statementId: string): Promise<StatementHistoryEntry[]> => {
  try {
    const historyRef = collection(db, STATEMENTS_COLLECTION, statementId, 'history');
    const q = query(historyRef, orderBy('changedAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as StatementHistoryEntry));
  } catch (error) {
    console.error('Error fetching statement history:', error);
    return [];
  }
};

// ==================== Projects ====================

export const getProjects = async (): Promise<Project[]> => {
  try {
    const q = query(collection(db, PROJECTS_COLLECTION), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Project;
    }
    return null;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

export const createProject = async (
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'currentBalance'>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<string> => {
  try {
    const projectData = {
      ...data,
      currentBalance: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user?.uid,
      createdByEmail: user?.email,
      createdByDisplayName: user?.displayName,
    };
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), projectData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (
  projectId: string,
  data: Partial<Project>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid,
      updatedByEmail: user?.email,
      updatedByDisplayName: user?.displayName,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// ==================== Statements ====================

export const getStatementsByProject = async (projectId: string): Promise<ProjectStatement[]> => {
  try {
    const q = query(
      collection(db, STATEMENTS_COLLECTION),
      where('projectId', '==', projectId)
    );
    const snapshot = await getDocs(q);
    const statements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProjectStatement));

    // Sort by date descending (client-side)
    return statements.sort((a, b) => {
      const getSeconds = (date: any) => {
        if (date?.seconds) return date.seconds;
        if (date instanceof Date) return date.getTime() / 1000;
        return 0;
      };
      return getSeconds(b.date) - getSeconds(a.date);
    });
  } catch (error) {
    console.error('Error fetching statements:', error);
    throw error;
  }
};

export const getStatementById = async (statementId: string): Promise<ProjectStatement | null> => {
  try {
    const docRef = doc(db, STATEMENTS_COLLECTION, statementId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as ProjectStatement;
    }
    return null;
  } catch (error) {
    console.error('Error fetching statement:', error);
    throw error;
  }
};

export const createStatement = async (
  projectId: string,
  data: { title: string; date: Date; previousBalance: number },
  user?: { uid: string; email?: string; displayName?: string }
): Promise<string> => {
  try {
    const statementData = {
      projectId,
      title: data.title,
      date: Timestamp.fromDate(data.date),
      status: 'DRAFT',
      totals: {
        totalIncome: 0,
        totalExpensePaid: 0,
        totalExpenseUnpaid: 0,
        netCashReal: 0,
      },
      previousBalance: data.previousBalance,
      finalBalance: data.previousBalance,
      transferAction: 'NONE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user?.uid,
      createdByEmail: user?.email,
      createdByDisplayName: user?.displayName,
    };
    const docRef = await addDoc(collection(db, STATEMENTS_COLLECTION), statementData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating statement:', error);
    throw error;
  }
};

export const updateStatement = async (
  statementId: string,
  updates: Partial<ProjectStatement>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    const docRef = doc(db, STATEMENTS_COLLECTION, statementId);

    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (user) {
      updateData.updatedBy = user.uid;
      updateData.updatedByEmail = user.email;
      updateData.updatedByDisplayName = user.displayName;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating statement:', error);
    throw error;
  }
};

// Delete statement (only DRAFT)
export const deleteStatement = async (statementId: string): Promise<void> => {
  try {
    const statement = await getStatementById(statementId);
    if (statement && statement.status === 'CLOSED') {
      throw new Error('Kapalı dönem silinemez');
    }
    const docRef = doc(db, STATEMENTS_COLLECTION, statementId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting statement:', error);
    throw error;
  }
};

// ==================== Statement Lines ====================

// Get statement lines (filter out soft-deleted for backward compatibility)
export const getStatementLines = async (statementId: string): Promise<StatementLine[]> => {
  try {
    const q = query(collection(db, STATEMENTS_COLLECTION, statementId, LINES_SUBCOLLECTION));
    const snapshot = await getDocs(q);
    const allLines = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StatementLine));

    // Filter out soft-deleted lines (for backward compatibility with old soft-deleted data)
    return allLines.filter(line => !line.isDeleted);
  } catch (error) {
    console.error('Error fetching lines:', error);
    throw error;
  }
};

// Create statement line (with history - synchronized with web)
export const createStatementLine = async (
  statementId: string,
  data: Omit<StatementLine, 'id' | 'statementId' | 'createdAt' | 'updatedAt'>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<string> => {
  try {
    const lineData = {
      ...data,
      statementId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(
      collection(db, STATEMENTS_COLLECTION, statementId, LINES_SUBCOLLECTION),
      lineData
    );

    // Add history entry for line creation (synchronized with web)
    if (user) {
      await addStatementHistoryEntry(statementId, null, user, 'LINE_ADD', {
        lineId: docRef.id,
        description: data.description,
        amount: data.amount,
        direction: data.direction,
      });
    }

    // Recalculate totals
    await recalculateStatementTotals(statementId, user);

    return docRef.id;
  } catch (error) {
    console.error('Error creating line:', error);
    throw error;
  }
};

// Update statement line (with history - synchronized with web)
export const updateStatementLine = async (
  statementId: string,
  lineId: string,
  updates: Partial<StatementLine>,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    const docRef = doc(db, STATEMENTS_COLLECTION, statementId, LINES_SUBCOLLECTION, lineId);

    // Get previous data for history
    const previousDoc = await getDoc(docRef);
    const previousData = previousDoc.exists() ? { id: previousDoc.id, ...previousDoc.data() } as StatementLine : null;

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Add history entry for line update (synchronized with web)
    if (user && previousData) {
      await addStatementHistoryEntry(statementId, previousData, user, 'LINE_UPDATE', {
        lineId,
        description: updates.description || previousData.description,
        amount: updates.amount !== undefined ? updates.amount : previousData.amount,
        direction: updates.direction || previousData.direction,
      });
    }

    // Recalculate totals
    await recalculateStatementTotals(statementId, user);
  } catch (error) {
    console.error('Error updating line:', error);
    throw error;
  }
};

// Delete statement line - HARD DELETE (synchronized with web)
export const deleteStatementLine = async (
  statementId: string,
  lineId: string,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    const docRef = doc(db, STATEMENTS_COLLECTION, statementId, LINES_SUBCOLLECTION, lineId);

    // Get previous data for history
    const previousDoc = await getDoc(docRef);
    const previousData = previousDoc.exists() ? { id: previousDoc.id, ...previousDoc.data() } as StatementLine : null;

    // HARD DELETE - synchronized with web behavior
    await deleteDoc(docRef);

    // Add history entry for line deletion (synchronized with web)
    if (user && previousData) {
      await addStatementHistoryEntry(statementId, previousData, user, 'LINE_DELETE', {
        lineId,
        description: previousData.description,
        amount: previousData.amount,
        direction: previousData.direction,
      });
    }

    // Recalculate totals
    await recalculateStatementTotals(statementId, user);
  } catch (error) {
    console.error('Error deleting line:', error);
    throw error;
  }
};

// ==================== Recalculate Totals ====================

export const recalculateStatementTotals = async (
  statementId: string,
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    // getStatementLines already filters out isDeleted lines
    const lines = await getStatementLines(statementId);

    let totalIncome = 0;
    let totalExpensePaid = 0;
    let totalExpenseUnpaid = 0;

    lines.forEach(line => {
      if (line.direction === 'INCOME') {
        totalIncome += line.amount;
      } else if (line.direction === 'EXPENSE') {
        if (line.isPaid) {
          totalExpensePaid += line.amount;
        } else {
          totalExpenseUnpaid += line.amount;
        }
      }
    });

    // Net Result = Income - (Paid + Unpaid) - synchronized with web
    const netCashReal = totalIncome - (totalExpensePaid + totalExpenseUnpaid);

    const statement = await getStatementById(statementId);
    if (!statement) throw new Error('Statement not found during recalculation');

    const finalBalance = statement.previousBalance + netCashReal;

    await updateStatement(statementId, {
      totals: {
        totalIncome,
        totalExpensePaid,
        totalExpenseUnpaid,
        netCashReal,
      },
      finalBalance,
    }, user);

    // SYNC PROJECT BALANCE: Update project's currentBalance with the latest finalBalance
    if (statement.projectId && statement.status === 'DRAFT') {
      const projectRef = doc(db, PROJECTS_COLLECTION, statement.projectId);
      await updateDoc(projectRef, {
        currentBalance: finalBalance,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error recalculating totals:', error);
    throw error;
  }
};

// ==================== Close Statement ====================

export const closeStatement = async (
  statementId: string,
  projectId: string,
  action: 'TRANSFERRED_TO_SAFE' | 'CARRIED_OVER',
  user?: { uid: string; email?: string; displayName?: string }
): Promise<void> => {
  try {
    const statement = await getStatementById(statementId);
    if (!statement) throw new Error('Statement not found');

    const finalBalance = statement.finalBalance;
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);

    const batch = writeBatch(db);

    // Update Statement
    const statementRef = doc(db, STATEMENTS_COLLECTION, statementId);
    batch.update(statementRef, {
      status: 'CLOSED',
      transferAction: action,
      updatedAt: serverTimestamp(),
    });

    // Update Project Balance
    let newProjectBalance = 0;
    if (action === 'CARRIED_OVER') {
      newProjectBalance = finalBalance;
    } else if (action === 'TRANSFERRED_TO_SAFE') {
      newProjectBalance = 0;
      // TODO: Create safe transaction record here if needed
    }

    batch.update(projectRef, {
      currentBalance: newProjectBalance,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    // Add history entry for closing (synchronized with web)
    if (user) {
      await addStatementHistoryEntry(statementId, statement, user, 'CLOSE');
    }
  } catch (error) {
    console.error('Error closing statement:', error);
    throw error;
  }
};
