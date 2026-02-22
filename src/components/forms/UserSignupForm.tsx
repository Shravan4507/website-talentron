import React, { useState } from 'react';
import './Forms.css';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getNextIdNumber, generateInitials } from '../../utils/idGenerator';
import { useToast } from '../toast/Toast';
import { majors } from '../../data/majors';
import DatePicker from '../date-picker/DatePicker';
import SearchableDropdown from '../searchable-dropdown/SearchableDropdown';
import collegesData from '../../data/colleges.json';
import { GENDER_OPTIONS } from '../types/user';

interface UserSignupFormProps {
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
    isAdminMode?: boolean;
}

const UserSignupForm: React.FC<UserSignupFormProps> = ({ initialData, onSuccess, onCancel, isAdminMode = false }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = React.useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '+91 ',
        dob: initialData?.dob || '',
        sex: initialData?.sex || '',
        college: initialData?.college || '',
        major: initialData?.major || '',
        studentId: initialData?.studentId || '',
        govId: initialData?.govId || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            let num = value.replace(/\D/g, '').substring(2);
            setFormData(prev => ({ ...prev, phone: `+91 ${num}` }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validatePhone = (phone: string) => {
        return /^\+91 \d{10}$/.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            showToast('Basic info is required', 'warning');
            return;
        }

        if (!validatePhone(formData.phone)) {
            showToast('Please enter a valid phone number', 'warning');
            return;
        }

        setLoading(true);
        try {
            let targetUid = initialData?.uid || initialData?.id;
            let talentronId = initialData?.talentronId;

            if (!initialData) {
                const initials = generateInitials(formData.firstName, formData.lastName);
                const idNum = await getNextIdNumber('user');
                talentronId = `TLRN-${initials}-${idNum}`;
                targetUid = isAdminMode ? `manual_u_${Date.now()}` : 'must_be_provided';
            }

            const userData = {
                ...initialData,
                ...formData,
                uid: targetUid,
                talentronId,
                role: 'user',
                updatedAt: new Date().toISOString()
            };

            if (!initialData) {
                userData.registeredAt = new Date().toISOString();
            }

            await setDoc(doc(db, 'users', targetUid), userData);
            
            showToast(`User ${initialData ? 'Updated' : 'Created'}! ID: ${talentronId}`, 'success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("User Form Error:", error);
            showToast("Failed to save user record.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="signup-form-component" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
                <div className="input-group">
                    <label>First Name*</label>
                    <input name="firstName" type="text" value={formData.firstName} required onChange={handleInputChange} />
                </div>
                <div className="input-group">
                    <label>Last Name*</label>
                    <input name="lastName" type="text" value={formData.lastName} required onChange={handleInputChange} />
                </div>
            </div>

            <div className="input-group">
                <label>Email Address*</label>
                <input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    disabled 
                    className="disabled-input"
                    placeholder="Enter Email"
                    required 
                />
            </div>

            <div className="form-row">
                <div className="input-group">
                    <label>Cell Phone*</label>
                    <input 
                        name="phone" 
                        type="tel" 
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={14}
                        required 
                    />
                </div>
                <div className="input-group">
                    <DatePicker
                        label="Date of Birth*"
                        value={formData.dob}
                        onChange={(val) => handleDropdownChange('dob', val)}
                        required={true}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="input-group">
                    <SearchableDropdown
                        label="Sex*"
                        placeholder="Select Sex"
                        options={GENDER_OPTIONS.map(opt => opt.label)}
                        value={formData.sex}
                        onChange={(val: string) => handleDropdownChange('sex', val)}
                        required={true}
                        allowManual={false}
                    />
                </div>
                <div className="input-group">
                    <SearchableDropdown
                        label="College*"
                        placeholder="Search College"
                        options={(collegesData as any[]).map(c => c.name || c)}
                        value={formData.college}
                        onChange={(val: string) => handleDropdownChange('college', val)}
                        required={true}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="input-group">
                    <SearchableDropdown
                        label="Major / Branch*"
                        placeholder="Select Major"
                        options={[...majors]}
                        value={formData.major}
                        onChange={(val: string) => handleDropdownChange('major', val)}
                        required={true}
                    />
                </div>
                <div className="input-group">
                    <label>Student ID / PRN</label>
                    <input name="studentId" type="text" value={formData.studentId} onChange={handleInputChange} placeholder="Enter ID" />
                </div>
            </div>

            <div className="form-actions">
                {onCancel && <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>}
                <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? 'SAVING...' : initialData ? 'Update User' : (isAdminMode ? 'Create User' : 'Complete Registration')}
                </button>
            </div>
        </form>
    );
};

export default UserSignupForm;
