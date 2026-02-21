import React, { useState } from 'react';
import './user-signup.css';
import SearchableDropdown from '../components/searchable-dropdown/SearchableDropdown';
import DatePicker from '../components/date-picker/DatePicker';
import collegesData from '../data/colleges.json';
import { majors } from '../data/majors';
import { GENDER_OPTIONS } from '../components/types/user';
import { useToast } from '../components/toast/Toast';

const UserSignup: React.FC = () => {
  const { showToast } = useToast();
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
      // Aadhaar Logic: Only digits, max 12
      let digits = rawVal.replace(/\D/g, '').substring(0, 12);
      formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      if (digits.length === 12) {
        error = null;
      } else if (rawVal.length >= 12) {
        error = 'Aadhaar must be 12 digits';
      }
    } else {
      // PAN Logic: LLLLLNNNNL
      let cleanPan = '';
      for (let i = 0; i < rawVal.length && i < 10; i++) {
        const char = rawVal[i];
        if (i < 5 || i === 9) {
          if (/[A-Z]/.test(char)) cleanPan += char;
        } else {
          if (/[0-9]/.test(char)) cleanPan += char;
        }
      }
      formatted = cleanPan;
      
      if (cleanPan.length === 10) {
        error = null;
      } else if (rawVal.length >= 10) {
        error = 'Invalid PAN format (ABCDE1234F)';
      }
    }

    setGovIdError(error);
    setFormData({ ...formData, govId: formatted });
  };

  const validatePhone = (phone: string) => {
    return /^\+91 \d{10}$/.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone to ensure only digits and max 10
    if (name === 'phone') {
      if (!value.startsWith('+91 ')) {
        setFormData({ ...formData, [name]: '+91 ' });
        return;
      }
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
      if (file.size > 256 * 1024) {
        showToast('File size exceeds 256KB limit', 'error');
        e.target.value = ''; // Reset input
        return;
      }
      setIdCard(file);
      showToast('ID Card uploaded successfully', 'success');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 256 * 1024) {
        showToast('File size exceeds 256KB limit', 'error');
        return;
      }
      setIdCard(file);
      showToast('ID Card uploaded successfully', 'success');
    }
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
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast('Please enter a valid email address', 'warning');
      return;
    }
    if (!formData.phone.trim()) {
      showToast('Cell Phone Number is required', 'warning');
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
    if (!formData.college.trim()) {
      showToast('College name is required', 'warning');
      return;
    }
    if (!formData.major.trim()) {
      showToast('Major/Department is required', 'warning');
      return;
    }
    if (!idCard) {
      showToast('Please upload your College ID Card', 'warning');
      return;
    }

    if (govIdError) {
      showToast('Please fix Government ID errors', 'warning');
      return;
    }

    console.log('User Signup Data:', { ...formData, idCard });
    showToast('Registration successful! Redirecting...', 'success');
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-header">
          <img 
            src="/assets/logos/ZCOER-Logo-White.png" 
            alt="ZCOER Logo" 
            className="signup-logo" 
          />
          <h1>Create Account</h1>
          <p>Complete your registration for Talentron 2026</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="input-group">
              <label>First Name*</label>
              <input 
                type="text" 
                name="firstName" 
                placeholder="Enter Your First Name" 
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Last Name*</label>
              <input 
                type="text" 
                name="lastName" 
                placeholder="Enter Your Last Name" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Email Address*</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter Your Email Address" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Cell Phone*</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="Enter Your 10-Digit Phone Number" 
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                maxLength={14}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <DatePicker
                label="Date of Birth*"
                value={formData.dob}
                onChange={(val) => handleDropdownChange('dob', val)}
                required={true}
              />
            </div>
            <div className="input-group">
              <SearchableDropdown
                label="Sex*"
                options={GENDER_OPTIONS.map(opt => opt.label)}
                value={formData.sex}
                onChange={(val) => handleDropdownChange('sex', val)}
                placeholder="Select Sex"
                required={true}
                allowManual={false}
              />
            </div>
          </div>

          <div className="input-group">
            <SearchableDropdown
              label="College*"
              options={collegesData}
              value={formData.college}
              onChange={(val) => handleDropdownChange('college', val)}
              placeholder="Search or enter your college"
              required={true}
              allowManual={true}
            />
          </div>

          <div className="input-group">
            <SearchableDropdown
              label="Major*"
              options={[...majors]}
              value={formData.major}
              onChange={(val) => handleDropdownChange('major', val)}
              placeholder="Search or enter your major"
              required={true}
              allowManual={true}
            />
          </div>

          <div className="input-group">
            <label>Upload (College ID Card)*</label>
            <div 
              className={`file-input-wrapper ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                name="idCard" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
                id="idCard"
              />
              <label htmlFor="idCard" className={`file-label ${isDragging ? 'active' : ''}`}>
                <div className="file-label-content">
                  <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>{idCard ? idCard.name : <>Choose File or Drag & Drop <i style={{ fontStyle: 'italic', opacity: 0.8 }}>(max 256KB)</i></>}</span>
                  <span className="file-types">ZIP, PDF, PNG, JPG up to 10MB</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Student ID Number</label>
              <input 
                type="text" 
                name="studentId" 
                placeholder="PRN / Roll No" 
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Government ID</label>
              <div className={`gov-id-wrapper ${govIdError ? 'has-error' : ''}`}>
                <input 
                  type="text" 
                  name="govId" 
                  placeholder="Aadhaar or PAN Card" 
                  value={formData.govId}
                  onChange={handleGovIdChange}
                  autoComplete="off"
                />
              </div>
              {govIdError && <span className="gov-error-message">{govIdError}</span>}
            </div>
          </div>

          <button type="submit" className="signup-btn">
            Register Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
