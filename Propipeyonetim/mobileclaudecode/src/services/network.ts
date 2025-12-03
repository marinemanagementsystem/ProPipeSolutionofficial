import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { NetworkContact, NetworkContactFormData } from '../types';

const NETWORK_COLLECTION = 'network_contacts';

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
    if (user?.uid) docData.createdBy = user.uid;
    if (user?.email) docData.createdByEmail = user.email;

    const docRef = await addDoc(collection(db, NETWORK_COLLECTION), docData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating network contact:', error);
    throw error;
  }
};

// Update contact
export const updateNetworkContact = async (
  id: string,
  data: Partial<NetworkContactFormData>,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);

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

    if (user?.uid) updateData.updatedBy = user.uid;
    if (user?.email) updateData.updatedByEmail = user.email;
    if (user?.displayName) updateData.updatedByDisplayName = user.displayName;

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating network contact:', error);
    throw error;
  }
};

// Soft delete contact
export const deleteNetworkContact = async (
  id: string,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);

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

// Restore soft-deleted contact
export const restoreNetworkContact = async (
  id: string,
  user?: { uid: string; email?: string | null; displayName?: string | null }
): Promise<void> => {
  try {
    const docRef = doc(db, NETWORK_COLLECTION, id);

    await updateDoc(docRef, {
      isDeleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp(),
      updatedBy: user?.uid || null,
    });
  } catch (error) {
    console.error('Error restoring network contact:', error);
    throw error;
  }
};
