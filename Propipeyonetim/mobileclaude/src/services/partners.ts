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
  Partner,
  PartnerFormData,
  PartnerStatement,
  PartnerStatementFormData,
  UserProfile
} from "../types";

// Partners
export const getPartners = async (): Promise<Partner[]> => {
  try {
    const partnersQuery = query(
      collection(db, "partners"),
      orderBy("name", "asc")
    );

    const snapshot = await getDocs(partnersQuery);
    const partners: Partner[] = [];

    snapshot.forEach((doc) => {
      partners.push({
        id: doc.id,
        ...doc.data()
      } as Partner);
    });

    return partners;
  } catch (error) {
    console.error("Ortaklar alınamadı:", error);
    throw error;
  }
};

export const getPartnerById = async (id: string): Promise<Partner | null> => {
  try {
    const docRef = doc(db, "partners", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Partner;
    }

    return null;
  } catch (error) {
    console.error("Ortak alınamadı:", error);
    throw error;
  }
};

export const createPartner = async (
  data: PartnerFormData,
  user: UserProfile
): Promise<string> => {
  try {
    const now = Timestamp.now();

    const partnerData = {
      name: data.name,
      sharePercentage: data.sharePercentage,
      baseSalary: data.baseSalary,
      currentBalance: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user.id,
      createdByEmail: user.email,
      createdByDisplayName: user.displayName,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    const docRef = await addDoc(collection(db, "partners"), partnerData);
    return docRef.id;
  } catch (error) {
    console.error("Ortak oluşturulamadı:", error);
    throw error;
  }
};

export const updatePartner = async (
  id: string,
  data: Partial<PartnerFormData & { isActive: boolean; currentBalance: number }>,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "partners", id);
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.sharePercentage !== undefined) updateData.sharePercentage = data.sharePercentage;
    if (data.baseSalary !== undefined) updateData.baseSalary = data.baseSalary;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.currentBalance !== undefined) updateData.currentBalance = data.currentBalance;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Ortak güncellenemedi:", error);
    throw error;
  }
};

// Partner Statements
export const getPartnerStatements = async (partnerId: string): Promise<PartnerStatement[]> => {
  try {
    const statementsQuery = query(
      collection(db, "partners", partnerId, "partner_statements"),
      orderBy("year", "desc"),
      orderBy("month", "desc")
    );

    const snapshot = await getDocs(statementsQuery);
    const statements: PartnerStatement[] = [];

    snapshot.forEach((doc) => {
      statements.push({
        id: doc.id,
        ...doc.data()
      } as PartnerStatement);
    });

    return statements;
  } catch (error) {
    console.error("Ortak hesap özetleri alınamadı:", error);
    throw error;
  }
};

export const getPartnerStatementById = async (
  partnerId: string,
  statementId: string
): Promise<PartnerStatement | null> => {
  try {
    const docRef = doc(db, "partners", partnerId, "partner_statements", statementId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as PartnerStatement;
    }

    return null;
  } catch (error) {
    console.error("Ortak hesap özeti alınamadı:", error);
    throw error;
  }
};

export const calculateNextMonthBalance = (data: {
  previousBalance: number;
  personalExpenseReimbursement: number;
  monthlySalary: number;
  profitShare: number;
  actualWithdrawn: number;
}): number => {
  const { previousBalance, personalExpenseReimbursement, monthlySalary, profitShare, actualWithdrawn } = data;
  return previousBalance + actualWithdrawn - (personalExpenseReimbursement + monthlySalary + profitShare);
};

export const createPartnerStatement = async (
  partnerId: string,
  data: PartnerStatementFormData
): Promise<string> => {
  try {
    const now = Timestamp.now();
    const nextMonthBalance = calculateNextMonthBalance(data);

    const statementData = {
      partnerId,
      month: data.month,
      year: data.year,
      status: "DRAFT",
      previousBalance: data.previousBalance,
      personalExpenseReimbursement: data.personalExpenseReimbursement,
      monthlySalary: data.monthlySalary,
      profitShare: data.profitShare,
      actualWithdrawn: data.actualWithdrawn,
      nextMonthBalance,
      note: data.note || null,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(
      collection(db, "partners", partnerId, "partner_statements"),
      statementData
    );
    return docRef.id;
  } catch (error) {
    console.error("Ortak hesap özeti oluşturulamadı:", error);
    throw error;
  }
};

export const updatePartnerStatement = async (
  partnerId: string,
  statementId: string,
  data: Partial<PartnerStatementFormData & { status: string }>
): Promise<void> => {
  try {
    const docRef = doc(db, "partners", partnerId, "partner_statements", statementId);
    const now = Timestamp.now();

    // Get current statement data
    const currentDoc = await getDoc(docRef);
    const currentData = currentDoc.data() as PartnerStatement;

    const updateData: Record<string, unknown> = {
      updatedAt: now
    };

    // Build updated data for recalculation
    const calcData = {
      previousBalance: data.previousBalance ?? currentData.previousBalance,
      personalExpenseReimbursement: data.personalExpenseReimbursement ?? currentData.personalExpenseReimbursement,
      monthlySalary: data.monthlySalary ?? currentData.monthlySalary,
      profitShare: data.profitShare ?? currentData.profitShare,
      actualWithdrawn: data.actualWithdrawn ?? currentData.actualWithdrawn
    };

    if (data.month !== undefined) updateData.month = data.month;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.previousBalance !== undefined) updateData.previousBalance = data.previousBalance;
    if (data.personalExpenseReimbursement !== undefined) updateData.personalExpenseReimbursement = data.personalExpenseReimbursement;
    if (data.monthlySalary !== undefined) updateData.monthlySalary = data.monthlySalary;
    if (data.profitShare !== undefined) updateData.profitShare = data.profitShare;
    if (data.actualWithdrawn !== undefined) updateData.actualWithdrawn = data.actualWithdrawn;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.status !== undefined) updateData.status = data.status;

    // Recalculate nextMonthBalance
    updateData.nextMonthBalance = calculateNextMonthBalance(calcData);

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Ortak hesap özeti güncellenemedi:", error);
    throw error;
  }
};

export const closePartnerStatement = async (
  partnerId: string,
  statementId: string,
  user: UserProfile
): Promise<void> => {
  try {
    // Get statement
    const statement = await getPartnerStatementById(partnerId, statementId);
    if (!statement) throw new Error("Hesap özeti bulunamadı");

    // Update statement status
    await updatePartnerStatement(partnerId, statementId, { status: "CLOSED" });

    // Update partner's current balance
    await updatePartner(partnerId, { currentBalance: statement.nextMonthBalance }, user);
  } catch (error) {
    console.error("Ortak hesap özeti kapatılamadı:", error);
    throw error;
  }
};
