import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { NetworkContact, NetworkContactFormData, NetworkHistoryEntry } from '../types';

const NETWORK_COLLECTION = 'network_contacts';

// ==================== HISTORY FUNCTIONS ====================

// Add history entry for network contact changes
export const addNetworkHistoryEntry = async (
  contactId: string,
  previousData: NetworkContact,
  user: { uid: string; email?: string | null; displayName?: string | null },
  changeType: 'UPDATE' | 'DELETE' | 'REVERT'
): Promise<void> => {
  try {
    const historyRef = collection(db, NETWORK_COLLECTION, contactId, 'history');
    const historyEntry: Omit<NetworkHistoryEntry, 'id'> = {
      contactId,
      previousData,
      changedAt: Timestamp.now(),
      changedByUserId: user.uid,
      changedByEmail: user.email || null,
      changedByDisplayName: user.displayName || null,
      changeType,
    };
    await addDoc(historyRef, historyEntry);
  } catch (error) {
    console.error('Error adding network history entry:', error);
    // History hatası ana işlemi durdurmamalı, sadece logluyoruz.
  }
};

// Get network contact history
export const getNetworkHistory = async (contactId: string): Promise<NetworkHistoryEntry[]> => {
  try {
    const historyRef = collection(db, NETWORK_COLLECTION, contactId, 'history');
    const q = query(historyRef, orderBy('changedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as NetworkHistoryEntry));
  } catch (error) {
    console.error('Error fetching network history:', error);
    return [];
  }
};

// ==================== CRUD OPERATIONS ====================

// Get all network contacts
export const getNetworkContacts = async (showDeleted: boolean = false): Promise<NetworkContact[]> => {
  try {
    // Simple query to avoid index issues
    const q = query(collection(db, NETWORK_COLLECTION), orderBy('companyName', 'asc'));
    const snapshot = await getDocs(q);
    const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NetworkContact));

    return showDeleted
      ? contacts.filter(c => c.isDeleted === true)
      : contacts.filter(c => !c.isDeleted);
  } catch (error) {
    console.error('Error fetching network contacts:', error);
    throw error;
  }
};

// Get single contact by ID
export const getNetworkContactById = async (id: string): Promise<NetworkContact | null> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as NetworkContact;
    }
    return null;
  } catch (error) {
    console.error('Error fetching network contact:', error);
    throw error;
  }
};

// Create new contact
export const createNetworkContact = async (
  data: NetworkContactFormData,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<string> => {
  try {
    const docData: Record<string, any> = {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      category: data.category,
      contactStatus: data.contactStatus,
      quoteStatus: data.quoteStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isDeleted: false,
    };

    if (data.phone) docData.phone = data.phone;
    if (data.email) docData.email = data.email;
    if (data.serviceArea) docData.serviceArea = data.serviceArea;
    if (data.shipType) docData.shipType = data.shipType;
    if (data.quoteDate) docData.quoteDate = Timestamp.fromDate(data.quoteDate);
    if (data.result) docData.result = data.result;
    if (data.notes) docData.notes = data.notes;
    if (data.lastContactDate) docData.lastContactDate = Timestamp.fromDate(data.lastContactDate);
    if (data.nextActionDate) docData.nextActionDate = Timestamp.fromDate(data.nextActionDate);
    if (user?.uid) docData.createdBy = user.uid;
    if (user?.email) docData.createdByEmail = user.email;

    const docRef = await addDoc(collection(db, NETWORK_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating network contact:', error);
    throw error;
  }
};

// Update contact (with history - synchronized with web)
export const updateNetworkContact = async (
  id: string,
  data: Partial<NetworkContactFormData>,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);

    // Get previous data for history (synchronized with web)
    if (user) {
      const previousDoc = await getDoc(docRef);
      if (previousDoc.exists()) {
        const previousData = { id: previousDoc.id, ...previousDoc.data() } as NetworkContact;
        await addNetworkHistoryEntry(id, previousData, user, 'UPDATE');
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.serviceArea !== undefined) updateData.serviceArea = data.serviceArea || null;
    if (data.shipType !== undefined) updateData.shipType = data.shipType || null;
    if (data.contactStatus !== undefined) updateData.contactStatus = data.contactStatus;
    if (data.quoteStatus !== undefined) updateData.quoteStatus = data.quoteStatus;
    if (data.result !== undefined) updateData.result = data.result || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.quoteDate !== undefined) {
      updateData.quoteDate = data.quoteDate ? Timestamp.fromDate(data.quoteDate) : null;
    }
    if (data.lastContactDate !== undefined) {
      updateData.lastContactDate = data.lastContactDate ? Timestamp.fromDate(data.lastContactDate) : null;
    }
    if (data.nextActionDate !== undefined) {
      updateData.nextActionDate = data.nextActionDate ? Timestamp.fromDate(data.nextActionDate) : null;
    }

    if (user?.uid) updateData.updatedBy = user.uid;
    if (user?.email) updateData.updatedByEmail = user.email;
    if (user?.displayName) updateData.updatedByDisplayName = user.displayName;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating network contact:', error);
    throw error;
  }
};

// Soft delete contact (with history - synchronized with web)
export const deleteNetworkContact = async (
  id: string,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);

    // Get previous data for history (synchronized with web)
    if (user) {
      const previousDoc = await getDoc(docRef);
      if (previousDoc.exists()) {
        const previousData = { id: previousDoc.id, ...previousDoc.data() } as NetworkContact;
        await addNetworkHistoryEntry(id, previousData, user, 'DELETE');
      }
    }

    await updateDoc(docRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || null,
      updatedByEmail: user?.email || null,
      updatedByDisplayName: user?.displayName || null,
    });
  } catch (error) {
    console.error('Error deleting network contact:', error);
    throw error;
  }
};

// Restore soft-deleted contact (with history)
export const restoreNetworkContact = async (
  id: string,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);

    // Get previous data for history
    if (user) {
      const previousDoc = await getDoc(docRef);
      if (previousDoc.exists()) {
        const previousData = { id: previousDoc.id, ...previousDoc.data() } as NetworkContact;
        await addNetworkHistoryEntry(id, previousData, user, 'REVERT');
      }
    }

    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || null,
      updatedByEmail: user?.email || null,
      updatedByDisplayName: user?.displayName || null,
    });
  } catch (error) {
    console.error('Error restoring network contact:', error);
    throw error;
  }
};

// Revert to a specific history entry
export const revertNetworkContactToHistory = async (
  contactId: string,
  targetHistoryEntry: NetworkHistoryEntry,
  user: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, contactId);
    const currentDoc = await getDoc(docRef);

    if (!currentDoc.exists()) {
      throw new Error('Network contact not found - cannot revert');
    }

    const currentData = { id: currentDoc.id, ...currentDoc.data() } as NetworkContact;

    // Revert işlemi de bir değişikliktir, history'ye ekle
    await addNetworkHistoryEntry(contactId, currentData, user, 'REVERT');

    // Previous Data'yı geri yükle
    const dataToRestore = targetHistoryEntry.previousData;
    const { id, createdAt, updatedAt, ...rest } = dataToRestore;

    await updateDoc(docRef, {
      ...rest,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
      updatedByEmail: user.email,
      updatedByDisplayName: user.displayName,
    });
  } catch (error) {
    console.error('Error reverting network contact:', error);
    throw error;
  }
};

// Hard delete contact (permanent)
export const hardDeleteNetworkContact = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error hard deleting network contact:', error);
    throw error;
  }
};
