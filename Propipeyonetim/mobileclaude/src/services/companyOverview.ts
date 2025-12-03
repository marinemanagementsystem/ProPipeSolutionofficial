import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { CompanyOverview, UserProfile } from "../types";

export const getCompanyOverview = async (): Promise<CompanyOverview | null> => {
  try {
    const docRef = doc(db, "companyOverview", "main");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as CompanyOverview;
    }

    return null;
  } catch (error) {
    console.error("Şirket genel durumu alınamadı:", error);
    throw error;
  }
};

export const updateCompanyOverview = async (
  data: { companySafeBalance: number },
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "companyOverview", "main");
    const now = Timestamp.now();

    await setDoc(docRef, {
      companySafeBalance: data.companySafeBalance,
      currency: "TRY",
      lastUpdatedAt: now,
      updatedByUserId: user.id
    }, { merge: true });
  } catch (error) {
    console.error("Şirket genel durumu güncellenemedi:", error);
    throw error;
  }
};
