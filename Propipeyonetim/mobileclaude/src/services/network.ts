import {
  collection,
  query,
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
import { NetworkContact, NetworkContactFormData, UserProfile } from "../types";

export const getNetworkContacts = async (showDeleted: boolean = false): Promise<NetworkContact[]> => {
  try {
    const networkQuery = query(
      collection(db, "networkActions"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(networkQuery);
    let contacts: NetworkContact[] = [];

    snapshot.forEach((doc) => {
      contacts.push({
        id: doc.id,
        ...doc.data()
      } as NetworkContact);
    });

    if (!showDeleted) {
      contacts = contacts.filter(c => !c.isDeleted);
    }

    return contacts;
  } catch (error) {
    console.error("Network kayıtları alınamadı:", error);
    throw error;
  }
};

export const getNetworkContactById = async (id: string): Promise<NetworkContact | null> => {
  try {
    const docRef = doc(db, "networkActions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as NetworkContact;
    }

    return null;
  } catch (error) {
    console.error("Network kaydı alınamadı:", error);
    throw error;
  }
};

export const createNetworkContact = async (
  data: NetworkContactFormData,
  user: UserProfile
): Promise<string> => {
  try {
    const now = Timestamp.now();

    const contactData = {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      phone: data.phone || null,
      email: data.email || null,
      category: data.category,
      serviceArea: data.serviceArea || null,
      shipType: data.shipType || null,
      contactStatus: data.contactStatus,
      quoteStatus: data.quoteStatus,
      result: data.result || null,
      lastContactDate: data.lastContactDate ? Timestamp.fromDate(data.lastContactDate) : null,
      nextActionDate: data.nextActionDate ? Timestamp.fromDate(data.nextActionDate) : null,
      quoteDate: data.quoteDate ? Timestamp.fromDate(data.quoteDate) : null,
      notes: data.notes || null,
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

    const docRef = await addDoc(collection(db, "networkActions"), contactData);
    return docRef.id;
  } catch (error) {
    console.error("Network kaydı oluşturulamadı:", error);
    throw error;
  }
};

export const updateNetworkContact = async (
  id: string,
  data: Partial<NetworkContactFormData>,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "networkActions", id);
    const now = Timestamp.now();

    const updateData: Record<string, unknown> = {
      updatedAt: now,
      updatedBy: user.id,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName
    };

    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.serviceArea !== undefined) updateData.serviceArea = data.serviceArea;
    if (data.shipType !== undefined) updateData.shipType = data.shipType;
    if (data.contactStatus !== undefined) updateData.contactStatus = data.contactStatus;
    if (data.quoteStatus !== undefined) updateData.quoteStatus = data.quoteStatus;
    if (data.result !== undefined) updateData.result = data.result;
    if (data.lastContactDate !== undefined) {
      updateData.lastContactDate = data.lastContactDate ? Timestamp.fromDate(data.lastContactDate) : null;
    }
    if (data.nextActionDate !== undefined) {
      updateData.nextActionDate = data.nextActionDate ? Timestamp.fromDate(data.nextActionDate) : null;
    }
    if (data.quoteDate !== undefined) {
      updateData.quoteDate = data.quoteDate ? Timestamp.fromDate(data.quoteDate) : null;
    }
    if (data.notes !== undefined) updateData.notes = data.notes;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Network kaydı güncellenemedi:", error);
    throw error;
  }
};

export const deleteNetworkContact = async (
  id: string,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "networkActions", id);
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
    console.error("Network kaydı silinemedi:", error);
    throw error;
  }
};

export const restoreNetworkContact = async (
  id: string,
  user: UserProfile
): Promise<void> => {
  try {
    const docRef = doc(db, "networkActions", id);
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
    console.error("Network kaydı geri alınamadı:", error);
    throw error;
  }
};

export const hardDeleteNetworkContact = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "networkActions", id));
  } catch (error) {
    console.error("Network kaydı kalıcı olarak silinemedi:", error);
    throw error;
  }
};
