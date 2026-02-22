import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { generateInitials, getNextIdNumber } from '../utils/idGenerator';
import './user-signup.css';
import SearchableDropdown from '../components/searchable-dropdown/SearchableDropdown';
import DatePicker from '../components/date-picker/DatePicker';
import collegesData from '../data/colleges.json';
import { majors } from '../data/majors';
import { GENDER_OPTIONS } from '../components/types/user';
import { useToast } from '../components/toast/Toast';
import { assetPath } from '../utils/assetPath';

const UserSignup: React.FC = () => {
    const { currentUser, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+91 ',
        dob: '',
        sex: '',
        college: '',
        major: '',
        studentId: '',
        govId: ''
    });

    const [idCard, setIdCard] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [govIdError, setGovIdError] = useState<string | null>(null);

    // Pre-fill from Google - Redirection is now handled by PublicRoute wrapper in App.tsx
    useEffect(() => {
        if (!currentUser) return;

        const names = currentUser.displayName?.split(' ') || ['', ''];
        setFormData(prev => ({
            ...prev,
            firstName: prev.firstName || names[0] || '',
            lastName: prev.lastName || names.slice(1).join(' ') || '',
            email: currentUser.email || ''
        }));
    }, [currentUser]);

    const handleGovIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let rawVal = e.target.value.toUpperCase().replace(/\s/g, '');
        if (rawVal.length === 0) {
            setGovIdError(null);
            setFormData({ ...formData, govId: '' });
            return;
        }

        const firstChar = rawVal[0];
        const isAadhaar = /^\d$/.test(firstChar);
        let formatted = '';
        let error: string | null = null;

        if (isAadhaar) {
            let digits = rawVal.replace(/\D/g, '').substring(0, 12);
            formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
            if (digits.length !== 12 && rawVal.length >= 12) error = 'Aadhaar must be 12 digits';
        } else {
            let cleanPan = '';
            for (let i = 0; i < rawVal.length && i < 10; i++) {
                const char = rawVal[i];
                if (i < 5 || i === 9) { if (/[A-Z]/.test(char)) cleanPan += char; }
                else { if (/[0-9]/.test(char)) cleanPan += char; }
            }
            formatted = cleanPan;
            if (cleanPan.length !== 10 && rawVal.length >= 10) error = 'Invalid PAN format';
        }

        setGovIdError(error);
        setFormData({ ...formData, govId: formatted });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (!value.startsWith('+91 ')) { setFormData({ ...formData, [name]: '+91 ' }); return; }
            const digits = value.slice(4).replace(/\D/g, '').substring(0, 10);
            setFormData({ ...formData, [name]: '+91 ' + digits });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1024 * 1024 * 2) { // 2MB limit for sanity
                showToast('File size exceeds 2MB limit', 'error');
                e.target.value = '';
                return;
            }
            setIdCard(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        // Basic validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.college.trim() || !idCard) {
            showToast('Please fill all required fields and upload ID card', 'warning');
            return;
        }

        setLoading(true);
        try {
            // 1. Generate Unique TLRN ID first
            const initials = generateInitials(formData.firstName, formData.lastName);
            const idNum = await getNextIdNumber('user');
            const talentronId = `TLRN-${initials}-${idNum}`;

            // 2. Upload ID Card using a stable name (uid) to prevent duplicates
            // This ensures if a user retries, it overwrites the old attempt's file
            const storageRef = ref(storage, `id_cards/${currentUser.uid}`);
            await uploadBytes(storageRef, idCard);
            const idCardUrl = await getDownloadURL(storageRef);

            // 3. Save to Firestore
            const userData = {
                uid: currentUser.uid,
                talentronId,
                ...formData,
                idCardUrl,
                photoURL: currentUser.photoURL,
                role: 'user',
                registeredAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', currentUser.uid), userData);
            
            // 4. Force state update in AuthContext
            await refreshProfile();
            
            showToast('Registration complete! Welcome to Talentron.', 'success');
            navigate('/user-dashboard');
        } catch (error) {
            console.error("Signup failed:", error);
            showToast('Registration failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-card">
                <div className="signup-header">
                    <img src={assetPath('/assets/logos/ZCOER-Logo-White.png')} alt="ZCOER Logo" className="signup-logo" />
                    <h1>Create Account</h1>
                    <p>Complete your registration for Talentron 2026</p>
                </div>

                <form className="signup-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                        <div className="input-group">
                            <label>First Name*</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                            <label>Last Name*</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Email Address*</label>
                            <input type="email" name="email" value={formData.email} readOnly disabled />
                        </div>
                        <div className="input-group">
                            <label>Cell Phone*</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength={14} required />
                        </div>
                    </div>

                    <div className="form-row">
                        <DatePicker label="Date of Birth*" value={formData.dob} onChange={(val) => handleDropdownChange('dob', val)} required={true} />
                        <SearchableDropdown label="Sex*" options={GENDER_OPTIONS.map(opt => opt.label)} value={formData.sex} onChange={(val) => handleDropdownChange('sex', val)} placeholder="Select Sex" required={true} allowManual={false} />
                    </div>

                    <SearchableDropdown label="College*" options={collegesData as string[]} value={formData.college} onChange={(val) => handleDropdownChange('college', val)} placeholder="Search or enter your college" required={true} allowManual={true} />
                    <SearchableDropdown label="Major*" options={[...majors] as string[]} value={formData.major} onChange={(val) => handleDropdownChange('major', val)} placeholder="Search or enter your major" required={true} allowManual={true} />

                    <div className="input-group">
                        <label>Upload (College ID Card)*</label>
                        <div className={`file-input-wrapper ${isDragging ? 'dragging' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files[0]) setIdCard(e.dataTransfer.files[0]); }}>
                            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} required id="idCard" style={{ display: 'none' }} />
                            <label htmlFor="idCard" className="file-label">
                                <div className="file-label-content">
                                    <span>{idCard ? idCard.name : 'Click to upload ID Card (max 2MB)'}</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Student ID Number</label>
                            <input type="text" name="studentId" placeholder="PRN / Roll No" value={formData.studentId} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                            <label>Government ID</label>
                            <input type="text" name="govId" placeholder="Aadhaar or PAN Card" value={formData.govId} onChange={handleGovIdChange} />
                            {govIdError && <span className="gov-error-message">{govIdError}</span>}
                        </div>
                    </div>

                    <button type="submit" className="signup-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserSignup;
