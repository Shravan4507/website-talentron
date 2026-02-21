import React, { useState } from 'react';
import './admin-signup.css';
import { majors } from '../data/majors';
import DatePicker from '../components/date-picker/DatePicker';
import SearchableDropdown from '../components/searchable-dropdown/SearchableDropdown';
import { useToast } from '../components/toast/Toast';
import { assetPath } from '../utils/assetPath';

const ZCOER_COLLEGE = "Zeal Education Society's Zeal College of Engineering & Research, Narhe, Pune";

const AdminSignup: React.FC = () => {
    const { showToast } = useToast();
    const [step, setStep] = useState<'auth' | 'form'>('auth');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+91 ',
        dob: '',
        sex: '',
        college: ZCOER_COLLEGE,
        major: '',
        yearOfStudy: '',
        division: '',
        zprn: '',
        rollNo: ''
    });

    const handleGoogleSignup = () => {
        // Simulating Google Auth callback with pre-filled profile data
        console.log('Google Auth Success');
        setFormData(prev => ({
            ...prev,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@zcoer.edu.in'
        }));
        setStep('form');
    };

    const validatePhone = (phone: string) => {
        return /^\+91 \d{10}$/.test(phone);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Special handling for phone to ensure it starts with +91 and limited digits
        if (name === 'phone') {
            if (!value.startsWith('+91 ')) {
                setFormData(prev => ({ ...prev, [name]: '+91 ' }));
                return;
            }
            const digits = value.slice(4).replace(/\D/g, '').substring(0, 10);
            setFormData(prev => ({ ...prev, [name]: '+91 ' + digits }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Manual Validation for noValidate form
        if (!formData.firstName.trim()) {
            showToast('First Name is required', 'warning');
            return;
        }
        if (!formData.lastName.trim()) {
            showToast('Last Name is required', 'warning');
            return;
        }
        if (!validatePhone(formData.phone)) {
            showToast('Please enter a valid 10-digit phone number', 'warning');
            return;
        }
        if (!formData.dob) {
            showToast('Date of Birth is required', 'warning');
            return;
        }
        if (!formData.sex) {
            showToast('Please select your sex', 'warning');
            return;
        }
        if (!formData.major) {
            showToast('Please select your major', 'warning');
            return;
        }
        if (!formData.yearOfStudy) {
            showToast('Please select year of study', 'warning');
            return;
        }
        if (!formData.division) {
            showToast('Please select division', 'warning');
            return;
        }
        if (!formData.zprn.trim()) {
            showToast('ZPRN Number is required', 'warning');
            return;
        }

        console.log('Admin Data Submitted:', formData);
        showToast('Admin Profile completed successfully!', 'success');
    };

    // Generate Divisions: A to Z + Other
    const divisions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    return (
        <div className="admin-signup-page">
            <div className="admin-signup-bg-glow" />

            <div className={`admin-signup-card ${step === 'form' ? 'form-view' : ''}`}>
                <div className="admin-signup-logo-container">
                    <img
                        src={assetPath('/assets/logos/ZCOER-Logo-White.png')}
                        alt="ZCOER Logo"
                        className="admin-signup-logo"
                        draggable={false}
                    />
                </div>

                {step === 'auth' ? (
                    <>
                        <div className="admin-signup-header">
                            <h1>Create Admin Account</h1>
                            <p>Register as an administrator to manage Talentron portal</p>
                        </div>

                        <button className="google-signup-btn" onClick={handleGoogleSignup}>
                            <svg className="google-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94L5.84 14.1z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            Signup with Google
                        </button>
                    </>
                ) : (
                    <form className="signup-form" onSubmit={handleSubmit} noValidate>
                        <div className="admin-signup-header">
                            <h1>Complete Profile</h1>
                            <p>Please provide your administrative details</p>
                        </div>

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
                            <input name="email" type="email" value={formData.email} disabled className="disabled-input" />
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label>Cell Phone*</label>
                                <input 
                                    name="phone" 
                                    type="tel" 
                                    placeholder="Enter 10-Digit Number" 
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    autoComplete="tel"
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
                                <input name="zprn" type="text" placeholder="Enter Your ZPRN Number" required onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Roll Number</label>
                            <input name="rollNo" type="text" placeholder="Enter Your Roll Number" onChange={handleInputChange} />
                        </div>

                        <button type="submit" className="signup-btn">
                            Complete Setup
                        </button>
                    </form>
                )}

                <div className="admin-signup-footer">
                    <a href="/" className="admin-back-home">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminSignup;
