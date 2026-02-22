import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type AuditAction = 
    | 'APPROVE_REGISTRATION' 
    | 'REJECT_REGISTRATION' 
    | 'APPROVE_PROFILE_EDIT' 
    | 'DELETE_USER' 
    | 'DELETE_ADMIN' 
    | 'UPDATE_ADMIN_ROLE'
    | 'DELETE_REGISTRATION'
    | 'EXPORT_REGISTRATIONS'
    | 'EXPORT_RECORDS'
    | 'UNKNOWN_ACTION';

interface AuditLogEntry {
    adminId: string;
    adminName: string;
    action: AuditAction;
    targetId: string;
    targetName: string;
    details?: string;
}

export const logAdminAction = async (entry: AuditLogEntry) => {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            ...entry,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
    }
};
