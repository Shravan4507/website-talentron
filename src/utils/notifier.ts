import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface NotificationEntry {
    userId: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    link?: string;
    read: boolean;
}

export const sendNotification = async (entry: Omit<NotificationEntry, 'read'>) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            ...entry,
            read: false,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to send notification:", error);
    }
};
