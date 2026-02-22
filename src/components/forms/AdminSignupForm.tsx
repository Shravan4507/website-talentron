import React, { useState } from 'react';
import './Forms.css';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getNextIdNumber } from '../../utils/idGenerator';
import { useToast } from '../toast/Toast';
import { majors } from '../../data/majors';
import DatePicker from '../date-picker/DatePicker';
import SearchableDropdown from '../searchable-dropdown/SearchableDropdown';

interface AdminSignupFormProps {
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
    isAdminMode?: boolean; 
}

const ZCOER_COLLEGE = "Zeal Education Society's Zeal College of Engineering & Research, Narhe, Pune";

const AdminSignupForm: React.FC<AdminSignupFormProps> = ({ initialData, onSuccess, onCancel, isAdminMode = false }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = React.useState({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '+91 ',
        dob: initialData?.dob || '',
        sex: initialData?.sex || '',
        college: initialData?.college || ZCOER_COLLEGE,
        major: initialData?.major || '',
        yearOfStudy: initialData?.yearOfStudy || '',
        division: initialData?.division || '',
        zprn: initialData?.zprn || '',
        rollNo: initialData?.rollNo || ''
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
            showToast('Basic info (Name, Email) is required', 'warning');
            return;
        }

        if (!validatePhone(formData.phone)) {
            showToast('Please enter a valid 10-digit phone number', 'warning');
            return;
        }

        setLoading(true);
        try {
            let targetUid = initialData?.uid || initialData?.id;
            let adminUniqueId = initialData?.adminId;

            if (!initialData) {
                const adminIdNum = await getNextIdNumber('admin');
                adminUniqueId = `TLRN-ADM-${adminIdNum}`;
                targetUid = isAdminMode ? `manual_${Date.now()}` : 'must_be_provided';
            }

            const adminData = {
                ...initialData,
                ...formData,
                uid: targetUid,
                adminId: adminUniqueId,
                role: initialData?.role || 'Festival Administrator',
                permissions: initialData?.permissions || [],
                updatedAt: new Date().toISOString()
            };

            if (!initialData) {
                adminData.createdAt = new Date().toISOString();
            }

            await setDoc(doc(db, 'admins', targetUid), adminData);
            
            showToast(`Admin ${initialData ? 'Updated' : (isAdminMode ? 'Created' : 'Setup Complete')}! ID: ${adminUniqueId}`, 'success');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Admin Form Error:", error);
            showToast("Failed to save admin record.", "error");
        } finally {
            setLoading(false);
        }
    };

    const divisions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

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
                        options={["Male", "Female", "Other"]}
                        value={formData.sex}
                        onChange={(val: string) => handleDropdownChange('sex', val)}
                        required={true}
                        allowManual={false}
                    />
                </div>
                <div className="input-group">
                    <label>College*</label>
                    <input name="college" type="text" value={formData.college} disabled className="disabled-input" />
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
                    <SearchableDropdown
                        label="Year of Study*"
                        placeholder="Select Year"
                        options={["First Year", "Second Year", "Third Year", "Last Year"]}
                        value={formData.yearOfStudy}
                        onChange={(val: string) => handleDropdownChange('yearOfStudy', val)}
                        required={true}
                        allowManual={true}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="input-group">
                    <SearchableDropdown
                        label="Division*"
                        placeholder="Select Division"
                        options={divisions}
                        value={formData.division}
                        onChange={(val: string) => handleDropdownChange('division', val)}
                        required={true}
                    />
                </div>
                <div className="input-group">
                    <label>ZPRN Number*</label>
                    <input name="zprn" type="text" placeholder="Enter ZPRN" required onChange={handleInputChange} />
                </div>
            </div>

            <div className="input-group">
                <label>Roll Number</label>
                <input name="rollNo" type="text" placeholder="Enter Roll Number" onChange={handleInputChange} />
            </div>

            <div className="form-actions">
                {onCancel && <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>}
                <button type="submit" className="signup-btn" disabled={loading}>
                    {loading ? 'SAVING...' : initialData ? 'Update Admin' : (isAdminMode ? 'Create Admin' : 'Complete Setup')}
                </button>
            </div>
        </form>
    );
};

export default AdminSignupForm;
