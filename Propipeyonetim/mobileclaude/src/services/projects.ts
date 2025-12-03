import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  Project,
  ProjectFormData,
  ProjectStatement,
  StatementFormData,
  StatementLine,
  StatementLineFormData,
  UserProfile
} from "../types";

// Projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const projectsQuery = query(
      collection(db, "projects"),
      orderBy("name", "asc")
    );

    const snapshot = await getDocs(projectsQuery);
    const projects: Project[] = [];

    snapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data()
      } as Project);
    });

    return projects;
  } catch (error) {
    console.error("Tersaneler alınamadı:", error);
    throw error;
  }
};

export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const docRef = doc(db, "projects", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Project;
    }

    return null;
  } catch (error) {
    console.error("Tersane alınamadı:", error);
    throw error;
  }
};

export const createProject = async (
  data: ProjectFormData,
  user: UserProfile
): Promise<string> => {
  try {
    const now = Timestamp.now();

    const projectData = {
      name: data.name,
      location: data.location,
      currentBalance: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      createdByEmail: user.email,
      createdByDisplayName: user.displayName,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    const docRef = await addDoc(collection(db, "projects"), projectData);
    return docRef.id;
  } catch (error) {
    console.error("Tersane oluşturulamadı:", error);
    throw error;
  }
};

export const updateProject = async (
  id: string,
  data: Partial<ProjectFormData>,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "projects", id);
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.location !== undefined) updateData.location = data.location;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Tersane güncellenemedi:", error);
    throw error;
  }
};

// Project Statements
export const getProjectStatements = async (projectId: string): Promise<ProjectStatement[]> => {
  try {
    const statementsQuery = query(
      collection(db, "projects", projectId, "project_statements"),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(statementsQuery);
    const statements: ProjectStatement[] = [];

    snapshot.forEach((doc) => {
      statements.push({
        id: doc.id,
        ...doc.data()
      } as ProjectStatement);
    });

    return statements;
  } catch (error) {
    console.error("Hakediş dosyaları alınamadı:", error);
    throw error;
  }
};

export const getStatementById = async (
  projectId: string,
  statementId: string
): Promise<ProjectStatement | null> => {
  try {
    const docRef = doc(db, "projects", projectId, "project_statements", statementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as ProjectStatement;
    }

    return null;
  } catch (error) {
    console.error("Hakediş alınamadı:", error);
    throw error;
  }
};

export const createStatement = async (
  projectId: string,
  data: StatementFormData,
  user: UserProfile
): Promise<string> => {
  try {
    const now = Timestamp.now();

    const statementData = {
      projectId,
      title: data.title,
      date: Timestamp.fromDate(data.date),
      status: "DRAFT",
      totals: {
        totalIncome: 0,
        totalExpensePaid: 0,
        totalExpenseUnpaid: 0,
        netCashReal: 0
      },
      previousBalance: data.previousBalance,
      finalBalance: data.previousBalance,
      transferAction: "NONE",
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      createdByEmail: user.email,
      createdByDisplayName: user.displayName,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    const docRef = await addDoc(
      collection(db, "projects", projectId, "project_statements"),
      statementData
    );
    return docRef.id;
  } catch (error) {
    console.error("Hakediş oluşturulamadı:", error);
    throw error;
  }
};

export const updateStatement = async (
  projectId: string,
  statementId: string,
  data: Partial<StatementFormData & { status: string; transferAction: string }>,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "projects", projectId, "project_statements", statementId);
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.date !== undefined) updateData.date = Timestamp.fromDate(data.date);
    if (data.previousBalance !== undefined) updateData.previousBalance = data.previousBalance;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.transferAction !== undefined) updateData.transferAction = data.transferAction;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Hakediş güncellenemedi:", error);
    throw error;
  }
};

export const recalculateStatementTotals = async (
  projectId: string,
  statementId: string
): Promise<void> => {
  try {
    // Get all statement lines
    const linesSnapshot = await getDocs(
      collection(db, "projects", projectId, "project_statements", statementId, "statement_lines")
    );

    let totalIncome = 0;
    let totalExpensePaid = 0;
    let totalExpenseUnpaid = 0;

    linesSnapshot.forEach((doc) => {
      const line = doc.data();
      if (line.direction === "INCOME") {
        totalIncome += line.amount || 0;
      } else {
        if (line.isPaid) {
          totalExpensePaid += line.amount || 0;
        } else {
          totalExpenseUnpaid += line.amount || 0;
        }
      }
    });

    const netCashReal = totalIncome - totalExpensePaid;

    // Get statement to get previousBalance
    const statementDoc = await getDoc(
      doc(db, "projects", projectId, "project_statements", statementId)
    );
    const previousBalance = statementDoc.data()?.previousBalance || 0;
    const finalBalance = previousBalance + netCashReal;

    // Update statement totals
    await updateDoc(
      doc(db, "projects", projectId, "project_statements", statementId),
      {
        totals: {
          totalIncome,
          totalExpensePaid,
          totalExpenseUnpaid,
          netCashReal
        },
        finalBalance,
        updatedAt: Timestamp.now()
      }
    );
  } catch (error) {
    console.error("Hakediş toplamları hesaplanamadı:", error);
    throw error;
  }
};

// Statement Lines
export const getStatementLines = async (
  projectId: string,
  statementId: string
): Promise<StatementLine[]> => {
  try {
    const linesQuery = query(
      collection(db, "projects", projectId, "project_statements", statementId, "statement_lines"),
      orderBy("createdAt", "asc")
    );

    const snapshot = await getDocs(linesQuery);
    const lines: StatementLine[] = [];

    snapshot.forEach((doc) => {
      lines.push({
        id: doc.id,
        ...doc.data()
      } as StatementLine);
    });

    return lines;
  } catch (error) {
    console.error("Hakediş satırları alınamadı:", error);
    throw error;
  }
};

export const addStatementLine = async (
  projectId: string,
  statementId: string,
  data: StatementLineFormData
): Promise<string> => {
  try {
    const now = Timestamp.now();

    const lineData = {
      statementId,
      direction: data.direction,
      category: data.category,
      amount: data.amount,
      isPaid: data.isPaid,
      description: data.description,
      relatedExpenseId: data.relatedExpenseId || null,
      partnerId: data.partnerId || null,
      paidAt: data.isPaid ? now : null,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(
      collection(db, "projects", projectId, "project_statements", statementId, "statement_lines"),
      lineData
    );

    // Recalculate totals
    await recalculateStatementTotals(projectId, statementId);

    return docRef.id;
  } catch (error) {
    console.error("Hakediş satırı eklenemedi:", error);
    throw error;
  }
};

export const updateStatementLine = async (
  projectId: string,
  statementId: string,
  lineId: string,
  data: Partial<StatementLineFormData>
): Promise<void> => {
  try {
    const docRef = doc(
      db,
      "projects",
      projectId,
      "project_statements",
      statementId,
      "statement_lines",
      lineId
    );
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now
    };

    if (data.direction !== undefined) updateData.direction = data.direction;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.isPaid !== undefined) {
      updateData.isPaid = data.isPaid;
      updateData.paidAt = data.isPaid ? now : null;
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.relatedExpenseId !== undefined) updateData.relatedExpenseId = data.relatedExpenseId;
    if (data.partnerId !== undefined) updateData.partnerId = data.partnerId;

    await updateDoc(docRef, updateData);

    // Recalculate totals
    await recalculateStatementTotals(projectId, statementId);
  } catch (error) {
    console.error("Hakediş satırı güncellenemedi:", error);
    throw error;
  }
};

export const deleteStatementLine = async (
  projectId: string,
  statementId: string,
  lineId: string
): Promise<void> => {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(
      doc(
        db,
        "projects",
        projectId,
        "project_statements",
        statementId,
        "statement_lines",
        lineId
      )
    );

    // Recalculate totals
    await recalculateStatementTotals(projectId, statementId);
  } catch (error) {
    console.error("Hakediş satırı silinemedi:", error);
    throw error;
  }
};

export const closeStatement = async (
  projectId: string,
  statementId: string,
  user: UserProfile
): Promise<void> => {
  try {
    // Update statement status
    await updateStatement(projectId, statementId, { status: "CLOSED" }, user);

    // Get statement to update project balance
    const statement = await getStatementById(projectId, statementId);
    if (statement) {
      await updateDoc(doc(db, "projects", projectId), {
        currentBalance: statement.finalBalance,
        updatedAt: Timestamp.now(),
        updatedBy: user.id,
        updatedByEmail: user.email,
        updatedByDisplayName: user.displayName
      });
    }
  } catch (error) {
    console.error("Hakediş kapatılamadı:", error);
    throw error;
  }
};
