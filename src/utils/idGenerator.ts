import { db } from '../firebase/config';
import { doc, updateDoc, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';

/**
 * Generates user initials for the TLRN-XXX-0000 format.
 * If FirstName >= 3, take first 3 of FirstName.
 * Else, take FirstName + enough chars from LastName to reach 3.
 */
export const generateInitials = (firstName: string, lastName: string): string => {
    let initials = firstName.trim().toUpperCase();
    if (initials.length >= 3) {
        return initials.substring(0, 3);
    }
    
    const lastPart = lastName.trim().toUpperCase();
    initials += lastPart;
    
    return initials.substring(0, 3).padEnd(3, 'X'); // Pad with X just in case
};

/**
 * Gets the next available incrementing number for User or Admin.
 * Implements the "No Wastage" recycling logic using a transaction.
 */
export const getNextIdNumber = async (type: 'user' | 'admin'): Promise<string> => {
    const metaRef = doc(db, 'metadata', 'id_counters');
    const field = type === 'user' ? 'recycledUserIds' : 'recycledAdminIds';
    const counterField = type === 'user' ? 'userCounter' : 'adminCounter';

    return await runTransaction(db, async (transaction) => {
        const metaDoc = await transaction.get(metaRef);
        
        if (!metaDoc.exists()) {
            const initialData = { userCounter: 1, adminCounter: 1, recycledUserIds: [], recycledAdminIds: [] };
            transaction.set(metaRef, initialData);
            return '0001';
        }

        const data = metaDoc.data();
        const recycled = data[field] || [];

        if (recycled.length > 0) {
            // Pick the smallest recycled number to keep it tidy
            const nextNum = Math.min(...recycled);
            transaction.update(metaRef, {
                [field]: arrayRemove(nextNum)
            });
            return nextNum.toString().padStart(4, '0');
        } else {
            // No recycled numbers, use the global counter
            const currentCounter = data[counterField] || 0;
            const nextCounter = currentCounter + 1;
            transaction.update(metaRef, {
                [counterField]: nextCounter
            });
            return nextCounter.toString().padStart(4, '0');
        }
    });
};

/**
 * Recycles an ID number when an account is deleted.
 */
export const recycleIdNumber = async (id: string, type: 'user' | 'admin') => {
    // Extract the numeric part (last 4 digits)
    const numPart = parseInt(id.split('-').pop() || '0', 10);
    if (numPart === 0) return;

    const metaRef = doc(db, 'metadata', 'id_counters');
    const field = type === 'user' ? 'recycledUserIds' : 'recycledAdminIds';

    await updateDoc(metaRef, {
        [field]: arrayUnion(numPart)
    });
};
