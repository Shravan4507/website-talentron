import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    deleteUser,
    reauthenticateWithPopup,
    type User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { auth, googleProvider, db, storage } from '../firebase/config';
import { recycleIdNumber } from '../utils/idGenerator';

interface AuthContextType {
    currentUser: FirebaseUser | null;
    userProfile: any | null;
    loading: boolean;
    isAdmin: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
    reauthenticate: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
            setIsAdmin(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const deleteAccount = async () => {
        if (!auth.currentUser) return;
        
        try {
            const uid = auth.currentUser.uid;
            
            // 1. Delete ID Card from Storage (if exists)
            const idCardRef = ref(storage, `id_cards/${uid}`);
            try {
                await deleteObject(idCardRef);
            } catch (storageErr) {
                console.log("No storage file to delete or already deleted");
            }
            
            // 2. Delete Firestore Data
            await deleteDoc(doc(db, 'users', uid));
            await deleteDoc(doc(db, 'admins', uid));
            
            // 3. Delete Auth User
            await deleteUser(auth.currentUser);
            
            // 4. Recycle the ID ONLY if everything above succeeded
            if (userProfile?.talentronId) {
                await recycleIdNumber(userProfile.talentronId, isAdmin ? 'admin' : 'user');
            }
            
            // 5. Reset State
            setCurrentUser(null);
            setUserProfile(null);
            setIsAdmin(false);
            
        } catch (error: any) {
            console.error("Account deletion failed:", error);
            if (error.code === 'auth/requires-recent-login') {
                throw new Error('RE_AUTH_REQUIRED');
            }
            throw error;
        }
    };

    const reauthenticate = async () => {
        if (!auth.currentUser) return;
        try {
            await reauthenticateWithPopup(auth.currentUser, googleProvider);
        } catch (error) {
            console.error("Re-authentication failed:", error);
            throw error;
        }
    };

    const refreshProfile = async () => {
        if (!auth.currentUser) return;
        const user = auth.currentUser;
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
            setUserProfile(adminDoc.data());
            setIsAdmin(true);
        } else {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
                setIsAdmin(false);
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                // Check if user is an admin first
                const adminDoc = await getDoc(doc(db, 'admins', user.uid));
                if (adminDoc.exists()) {
                    setUserProfile(adminDoc.data());
                    setIsAdmin(true);
                } else {
                    // Check if regular user
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserProfile(userDoc.data());
                        setIsAdmin(false);
                    } else {
                        // User exists in Auth but not in Firestore -> Needs Signup
                        setUserProfile(null);
                        setIsAdmin(false);
                    }
                }
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        isAdmin,
        loginWithGoogle,
        logout,
        deleteAccount,
        reauthenticate,
        refreshProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
