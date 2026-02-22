import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { getNextIdNumber } from '../../utils/idGenerator';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import './AdminSignup.css';
import { useToast } from '../../components/toast/Toast';
import { assetPath } from '../../utils/assetPath';

const AdminSignup: React.FC = () => {
    const { currentUser, loginWithGoogle, refreshProfile } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Festival Administrator'
    });

    useEffect(() => {
        if (currentUser) {
            const names = currentUser.displayName?.split(' ') || ['', ''];
            setFormData({
                firstName: names[0] || '',
                lastName: names.slice(1).join(' ') || '',
                email: currentUser.email || '',
                role: 'Festival Administrator'
            });
        }
    }, [currentUser]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setLoading(true);
        try {
            const adminIdNum = await getNextIdNumber('admin');
            const adminUniqueId = `TLRN-ADM-${adminIdNum}`;

            const adminData = {
                uid: currentUser.uid,
                adminId: adminUniqueId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: formData.role,
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'admins', currentUser.uid), adminData);
            
            // Force state update in AuthContext
            await refreshProfile();
            
            showToast(`Admin Account Created! ID: ${adminUniqueId}`, 'success');
            navigate('/admin-dashboard');
        } catch (error) {
            console.error("Admin Signup Error:", error);
            showToast("Failed to create admin account.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="admin-signup-page">
                <div className="signup-card">
                    <h2>Admin Registration</h2>
                    <p>You must sign in with Google first to continue.</p>
                    <button className="google-login-btn" onClick={loginWithGoogle}>
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-signup-page">
            <div className="signup-card">
                <div className="admin-signup-header">
                    <img src={assetPath('/assets/logos/ZCOER-Logo-White.png')} alt="ZCOER Logo" className="admin-signup-logo" />
                    <OutlinedTitle text="ADMIN SETUP" fillColor="#ff00ea" outlineColor="#000" />
                </div>
                
                <form className="admin-form" onSubmit={handleSignup}>
                    <div className="input-group">
                        <label>First Name</label>
                        <input 
                            type="text" 
                            value={formData.firstName} 
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Last Name</label>
                        <input 
                            type="text" 
                            value={formData.lastName} 
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" value={formData.email} readOnly disabled />
                    </div>
                    <div className="input-group">
                        <label>Administrative Role</label>
                        <input type="text" value={formData.role} readOnly disabled />
                    </div>

                    <button type="submit" className="admin-signup-btn" disabled={loading}>
                        {loading ? 'INITIALIZING...' : 'CREATE ADMIN ACCOUNT'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSignup;
