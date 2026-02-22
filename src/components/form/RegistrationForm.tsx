import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../toast/Toast';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SearchableDropdown from '../searchable-dropdown/SearchableDropdown';
import { competitionsData, type Competition } from '../../data/competitionsData';
import './RegistrationForm.css';

interface RegistrationFormProps {
    eventName?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ eventName, onSuccess, onCancel }) => {
    const { userProfile } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        tlrnId: '',
        phone: '',
        whatsapp: '+91 ',
        college: '',
        competitionName: eventName || '',
        teamSize: 'Solo'
    });

    // Registration status
    const [alreadyRegistered, setAlreadyRegistered] = useState<any>(null);
    const [isCheckingReg, setIsCheckingReg] = useState(false);

    // Teammate state for Duo
    const [teammateIdInput, setTeammateIdInput] = useState('');
    const [teammateData, setTeammateData] = useState<any>(null);
    const [isFetchingTeammate, setIsFetchingTeammate] = useState(false);
    const [teammateAlreadyRegistered, setTeammateAlreadyRegistered] = useState<any>(null);

    // Prefill data from profile
    useEffect(() => {
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                fullName: `${userProfile.firstName} ${userProfile.lastName}`,
                email: userProfile.email,
                tlrnId: userProfile.talentronId || userProfile.adminId || '',
                phone: userProfile.phone || '',
                college: userProfile.college || '',
            }));
        }
    }, [userProfile]);

    // Check if current user is already registered
    useEffect(() => {
        const checkUserRegistration = async () => {
            if (!formData.tlrnId || !formData.competitionName) return;
            
            setIsCheckingReg(true);
            try {
                const regsRef = collection(db, 'registrations');
                
                // Check as POC
                const pocQuery = query(
                    regsRef, 
                    where('competitionName', '==', formData.competitionName),
                    where('tlrnId', '==', formData.tlrnId)
                );
                const pocSnapshot = await getDocs(pocQuery);
                
                if (!pocSnapshot.empty) {
                    setAlreadyRegistered({ type: 'self', data: pocSnapshot.docs[0].data() });
                    return;
                }

                // Check as Teammate
                const teamQuery = query(
                    regsRef,
                    where('competitionName', '==', formData.competitionName),
                    where('teammate.tlrnId', '==', formData.tlrnId)
                );
                const teamSnapshot = await getDocs(teamQuery);

                if (!teamSnapshot.empty) {
                    const regData = teamSnapshot.docs[0].data();
                    setAlreadyRegistered({ type: 'team', data: regData });
                }
            } catch (err) {
                console.error("Reg check error:", err);
            } finally {
                setIsCheckingReg(false);
            }
        };

        checkUserRegistration();
    }, [formData.tlrnId, formData.competitionName]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fetchTeammate = async () => {
        if (!teammateIdInput.trim()) {
            showToast("Please enter a TLRN ID", "warning");
            return;
        }

        if (teammateIdInput.trim() === formData.tlrnId) {
            showToast("You cannot add yourself as a teammate", "warning");
            return;
        }

        setIsFetchingTeammate(true);
        setTeammateAlreadyRegistered(null);
        try {
            // Check in users collection
            const userQuery = query(collection(db, 'users'), where('talentronId', '==', teammateIdInput.trim()));
            const userSnapshot = await getDocs(userQuery);
            
            let foundTeammate: any = null;
            if (!userSnapshot.empty) {
                foundTeammate = userSnapshot.docs[0].data();
            } else {
                // Check in admins collection
                const adminQuery = query(collection(db, 'admins'), where('adminId', '==', teammateIdInput.trim()));
                const adminSnapshot = await getDocs(adminQuery);
                if (!adminSnapshot.empty) {
                    foundTeammate = adminSnapshot.docs[0].data();
                }
            }

            if (foundTeammate) {
                setTeammateData(foundTeammate);
                
                // Now check if this teammate is already registered for this competition
                const tid = foundTeammate.talentronId || foundTeammate.adminId;
                const regsRef = collection(db, 'registrations');
                
                // Check as POC
                const pocQ = query(regsRef, where('competitionName', '==', formData.competitionName), where('tlrnId', '==', tid));
                const pocSnap = await getDocs(pocQ);
                
                if (!pocSnap.empty) {
                    setTeammateAlreadyRegistered({ type: 'self', data: pocSnap.docs[0].data() });
                    showToast("Teammate already registered!", "error");
                } else {
                    // Check as teammate
                    const teamQ = query(regsRef, where('competitionName', '==', formData.competitionName), where('teammate.tlrnId', '==', tid));
                    const teamSnap = await getDocs(teamQ);
                    
                    if (!teamSnap.empty) {
                        setTeammateAlreadyRegistered({ type: 'team', data: teamSnap.docs[0].data() });
                        showToast("Teammate already registered in another team!", "error");
                    } else {
                        showToast("Teammate found!", "success");
                    }
                }
            } else {
                showToast("No participant found with this ID", "error");
                setTeammateData(null);
            }
        } catch (error) {
            console.error("Error fetching teammate:", error);
            showToast("Error searching for teammate", "error");
        } finally {
            setIsFetchingTeammate(false);
        }
    };

    const handleNext = () => {
        if (formData.teamSize === 'Solo') {
            handleSubmit();
        } else if (formData.teamSize === 'Duo') {
            setCurrentStep(2);
        } else {
            showToast("Group registration logic coming soon!", "info");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const competition = competitionsData.find((c: Competition) => c.name === formData.competitionName);
            const category = competition?.category || 'General';

            const registrationId = `reg_${Date.now()}_${formData.tlrnId}`;
            const registrationData = {
                ...formData,
                category,
                registrationId,
                timestamp: new Date().toISOString(),
                status: 'pending',
                teammate: teammateData ? {
                    fullName: `${teammateData.firstName} ${teammateData.lastName}`,
                    tlrnId: teammateData.talentronId || teammateData.adminId,
                    email: teammateData.email,
                    phone: teammateData.phone || 'N/A',
                    whatsapp: teammateData.whatsapp || teammateData.phone || 'N/A',
                    college: teammateData.college || 'N/A'
                } : null
            };

            await setDoc(doc(db, 'registrations', registrationId), registrationData);
            showToast("Registration successful!", "success");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Registration failed:", error);
            showToast("Failed to register. Try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-card registration-card">
            <div className="signup-header">
                <h1>{currentStep === 1 ? 'Event Registration' : 'Teammate Details'}</h1>
                <p className="event-badge-pill">{formData.competitionName}</p>
            </div>

            <div className="form-steps-indicator">
                <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                <div className="step-line" />
                <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}>2</div>
            </div>

            {currentStep === 1 ? (
                <form className="signup-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                    {alreadyRegistered && (
                        <div className="already-registered-banner">
                            <span className="info-icon">⚠️</span>
                            <span>
                                {alreadyRegistered.type === 'self' 
                                    ? "You have already registered for this competition."
                                    : `You are already registered for this competition as a teammate of ${alreadyRegistered.data.fullName}.`
                                }
                            </span>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} readOnly className="read-only-input" />
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} readOnly className="read-only-input" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>TLRN ID</label>
                            <input type="text" name="tlrnId" value={formData.tlrnId} readOnly className="read-only-input" />
                        </div>
                        <div className="input-group">
                            <label>College</label>
                            <input type="text" name="college" value={formData.college} readOnly className="read-only-input" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label>Phone Number*</label>
                            <input 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div className="input-group">
                            <label>WhatsApp Number*</label>
                            <input 
                                type="tel" 
                                name="whatsapp" 
                                placeholder="WhatsApp Number" 
                                value={formData.whatsapp} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <SearchableDropdown
                                label="Team Size*"
                                options={['Solo', 'Duo', 'Group']}
                                value={formData.teamSize}
                                onChange={(val) => setFormData(prev => ({ ...prev, teamSize: val }))}
                                allowManual={false}
                                placeholder="Select Team Size"
                            />
                        </div>
                        <div className="input-group">
                            <label>Competition Name</label>
                            <input type="text" value={formData.competitionName} readOnly className="read-only-input" />
                        </div>
                    </div>

                    <div className="registration-actions">
                        <button type="button" className="back-btn" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="signup-btn" disabled={loading || !!alreadyRegistered || isCheckingReg}>
                            {isCheckingReg ? 'CHECKING...' : (formData.teamSize === 'Solo' ? (loading ? 'PROCESSING...' : 'CONFIRM PARTICIPATION') : 'NEXT')}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="teammate-step-container">
                    <p className="step-instruction">Enter your teammate's TLRN ID to proceed.</p>
                    
                    <div className="search-input-wrapper">
                        <input 
                            type="text" 
                            placeholder="TLRN-XXX-0000" 
                            value={teammateIdInput}
                            onChange={(e) => {
                                let val = e.target.value.toUpperCase();
                                
                                // Always maintain the prefix if they haven't completely cleared it
                                if (val.length > 0 && !val.startsWith('T')) {
                                    val = 'TLRN-' + val;
                                }
                                
                                // Extract the alphanumeric parts after TLRN-
                                let rawParts = val.replace(/^TLRN-?/, '').replace(/[^A-Z0-9]/g, '');
                                
                                // Re-format: TLRN- [3 initials] - [4 numbers]
                                let formatted = 'TLRN-';
                                if (rawParts.length > 0) {
                                    // First 3 chars are initials
                                    const letters = rawParts.substring(0, 3);
                                    formatted += letters;
                                    
                                    // If we have more than 3 chars, add the second dash for numbers
                                    if (rawParts.length > 3) {
                                        const numbers = rawParts.substring(3, 7);
                                        formatted += '-' + numbers;
                                    }
                                }
                                
                                // If they completely backspace, allow clearing to empty if needed
                                if (e.target.value === '') {
                                    setTeammateIdInput('');
                                } else {
                                    setTeammateIdInput(formatted);
                                }
                            }}
                            className="teammate-search-input"
                        />
                        <button 
                            type="button" 
                            className="fetch-btn" 
                            onClick={fetchTeammate}
                            disabled={isFetchingTeammate}
                        >
                            {isFetchingTeammate ? 'FINDING...' : 'VERIFY'}
                        </button>
                    </div>

                    {teammateData && (
                        <div className={`teammate-preview-card ${teammateAlreadyRegistered ? 'error-border' : ''}`}>
                            <div className="preview-header">
                                {teammateAlreadyRegistered ? 'Ineligible Teammate' : 'Teammate Found'}
                            </div>
                            <div className="preview-details">
                                <div className="preview-line"><strong>Name:</strong> {teammateData.firstName} {teammateData.lastName}</div>
                                <div className="preview-line"><strong>ID:</strong> {teammateData.talentronId || teammateData.adminId}</div>
                                <div className="preview-line"><strong>College:</strong> {teammateData.college}</div>
                                
                                {teammateAlreadyRegistered && (
                                    <div className="teammate-status-error">
                                        {teammateAlreadyRegistered.type === 'self'
                                            ? "Already Registered for this competition."
                                            : `Already Registered by ${teammateAlreadyRegistered.data.fullName}.`
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="registration-actions">
                        <button type="button" className="back-btn" onClick={() => setCurrentStep(1)}>Go Back</button>
                        <button 
                            type="button" 
                            className="signup-btn" 
                            onClick={handleSubmit} 
                            disabled={loading || !teammateData || !!teammateAlreadyRegistered}
                        >
                            {loading ? 'REGISTERING...' : 'CONFIRM DUO PARTICIPATION'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistrationForm;
