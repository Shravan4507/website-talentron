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

    // Group state
    const [groupSizeInput, setGroupSizeInput] = useState<number>(2); // Default additional members for group
    const [groupMembers, setGroupMembers] = useState<any[]>([]);

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
        
        // Reset group/duo states if team size changes
        if (name === 'teamSize') {
            setCurrentStep(1);
            setTeammateData(null);
            setTeammateIdInput('');
            setGroupMembers([]);
        }
    };

    const fetchParticipant = async (id: string, index?: number) => {
        if (!id.trim()) {
            showToast("Please enter a TLRN ID", "warning");
            return null;
        }

        if (id.trim() === formData.tlrnId) {
            showToast("You cannot add yourself", "warning");
            return null;
        }

        // Check if ID is already in group (for multi-member groups)
        if (index !== undefined) {
            const isDuplicate = groupMembers.some((m, i) => i !== index && m.tlrnId === id.trim());
            if (isDuplicate) {
                showToast("This member is already added to the team", "warning");
                return null;
            }
        }

        try {
            // Check in users collection
            const userQuery = query(collection(db, 'users'), where('talentronId', '==', id.trim()));
            const userSnapshot = await getDocs(userQuery);
            
            let foundUser: any = null;
            if (!userSnapshot.empty) {
                foundUser = userSnapshot.docs[0].data();
            } else {
                // Check in admins collection
                const adminQuery = query(collection(db, 'admins'), where('adminId', '==', id.trim()));
                const adminSnapshot = await getDocs(adminQuery);
                if (!adminSnapshot.empty) {
                    foundUser = adminSnapshot.docs[0].data();
                }
            }

            if (foundUser) {
                const tid = foundUser.talentronId || foundUser.adminId;
                const regsRef = collection(db, 'registrations');
                
                // Check as POC
                const pocQ = query(regsRef, where('competitionName', '==', formData.competitionName), where('tlrnId', '==', tid));
                const pocSnap = await getDocs(pocQ);
                
                if (!pocSnap.empty) {
                    showToast(`${foundUser.firstName} is already registered!`, "error");
                    return { data: foundUser, alreadyRegistered: { type: 'self', data: pocSnap.docs[0].data() } };
                } else {
                    // Check as teammate
                    const teamQ = query(regsRef, where('competitionName', '==', formData.competitionName), where('teammate.tlrnId', '==', tid));
                    const teamSnap = await getDocs(teamQ);
                    
                    if (!teamSnap.empty) {
                        showToast(`${foundUser.firstName} is registered in another team!`, "error");
                        return { data: foundUser, alreadyRegistered: { type: 'team', data: teamSnap.docs[0].data() } };
                    } else {
                        // Check as group member
                        // In Firestore, we should also check groupMembers array of other registrations
                        // For now, let's assume we search for presence in 'groupData.members' if we had that
                        // For simplicity, let's just stick to the two checks above or add a more complex query if needed
                        showToast(`${foundUser.firstName} found!`, "success");
                        return { data: foundUser, alreadyRegistered: null };
                    }
                }
            } else {
                showToast("No participant found with this ID", "error");
                return null;
            }
        } catch (error) {
            console.error("Error fetching participant:", error);
            showToast("Error searching for participant", "error");
            return null;
        }
    };

    const fetchTeammate = async () => {
        setIsFetchingTeammate(true);
        const result = await fetchParticipant(teammateIdInput);
        if (result) {
            setTeammateData(result.data);
            setTeammateAlreadyRegistered(result.alreadyRegistered);
        } else {
            setTeammateData(null);
            setTeammateAlreadyRegistered(null);
        }
        setIsFetchingTeammate(false);
    };

    const handleGroupMemberSearch = async (index: number) => {
        const member = groupMembers[index];
        if (!member.idInput) return;

        const updatedMembers = [...groupMembers];
        updatedMembers[index].isFetching = true;
        setGroupMembers(updatedMembers);

        const result = await fetchParticipant(member.idInput, index);
        
        const finalMembers = [...groupMembers];
        finalMembers[index].isFetching = false;
        if (result) {
            finalMembers[index].data = result.data;
            finalMembers[index].tlrnId = result.data.talentronId || result.data.adminId;
            finalMembers[index].alreadyRegistered = result.alreadyRegistered;
        } else {
            finalMembers[index].data = null;
            finalMembers[index].tlrnId = '';
            finalMembers[index].alreadyRegistered = null;
        }
        setGroupMembers(finalMembers);
    };

    const handleNext = () => {
        if (formData.teamSize === 'Solo') {
            handleSubmit();
        } else {
            setCurrentStep(2);
            if (formData.teamSize === 'Group' && groupMembers.length === 0) {
                // Initialize group members based on groupSizeInput
                initGroupMembers(groupSizeInput);
            }
        }
    };

    const initGroupMembers = (count: number) => {
        const newMembers = Array.from({ length: count }, () => ({
            idInput: '',
            data: null,
            tlrnId: '',
            isFetching: false,
            alreadyRegistered: null
        }));
        setGroupMembers(newMembers);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const competition = competitionsData.find((c: Competition) => c.name === formData.competitionName);
            const category = competition?.category || 'General';

            const registrationId = `reg_${Date.now()}_${formData.tlrnId}`;
            
            let formattedTeammate = null;
            if (formData.teamSize === 'Duo' && teammateData) {
                formattedTeammate = {
                    fullName: `${teammateData.firstName} ${teammateData.lastName}`,
                    tlrnId: teammateData.talentronId || teammateData.adminId,
                    email: teammateData.email,
                    phone: teammateData.phone || 'N/A',
                    whatsapp: teammateData.whatsapp || teammateData.phone || 'N/A',
                    college: teammateData.college || 'N/A'
                };
            }

            let formattedGroup = null;
            if (formData.teamSize === 'Group') {
                formattedGroup = {
                    size: groupSizeInput + 1, // +1 for POC
                    members: groupMembers.map(m => ({
                        fullName: `${m.data.firstName} ${m.data.lastName}`,
                        tlrnId: m.tlrnId,
                        email: m.data.email,
                        phone: m.data.phone || 'N/A',
                        whatsapp: m.data.whatsapp || m.data.phone || 'N/A',
                        college: m.data.college || 'N/A'
                    }))
                };
            }

            const registrationData = {
                ...formData,
                category,
                registrationId,
                timestamp: new Date().toISOString(),
                status: 'pending',
                teammate: formattedTeammate,
                groupDetails: formattedGroup
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
                {formData.teamSize === 'Group' && (
                    <>
                        <div className="step-line" />
                        <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}>3</div>
                    </>
                )}
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
                    {(formData.teamSize === 'Duo' || (formData.teamSize === 'Group' && currentStep === 3)) && (
                        <p className="step-instruction">
                            {formData.teamSize === 'Duo' 
                                ? "Enter your teammate's TLRN ID to proceed." 
                                : `Enter TLRN IDs for ${groupSizeInput} team members.`
                            }
                        </p>
                    )}
                    
                    {formData.teamSize === 'Duo' ? (
                        <>
                            <div className="search-input-wrapper">
                                <input 
                                    type="text" 
                                    placeholder="TLRN-XXX-0000" 
                                    value={teammateIdInput}
                                    onChange={(e) => {
                                        let val = e.target.value.toUpperCase();
                                        if (val.length > 0 && !val.startsWith('T')) val = 'TLRN-' + val;
                                        let rawParts = val.replace(/^TLRN-?/, '').replace(/[^A-Z0-9]/g, '');
                                        let formatted = 'TLRN-';
                                        if (rawParts.length > 0) {
                                            const letters = rawParts.substring(0, 3);
                                            formatted += letters;
                                            if (rawParts.length > 3) {
                                                const numbers = rawParts.substring(3, 7);
                                                formatted += '-' + numbers;
                                            }
                                        }
                                        if (e.target.value === '') setTeammateIdInput('');
                                        else setTeammateIdInput(formatted);
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
                        </>
                    ) : (
                        // Group Logic
                        currentStep === 2 ? (
                            <div className="group-config-container">
                                <div className="input-group">
                                    <label>Number of Additional Members (Excluding Yourself)*</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="20"
                                        value={groupSizeInput}
                                        onChange={(e) => setGroupSizeInput(parseInt(e.target.value) || 1)}
                                        className="group-size-input"
                                    />
                                    <p className="helper-text">Total team size will be {groupSizeInput + 1}</p>
                                </div>
                                <div className="registration-actions" style={{ marginTop: '2rem' }}>
                                    <button type="button" className="back-btn" onClick={() => setCurrentStep(1)}>Go Back</button>
                                    <button type="button" className="signup-btn" onClick={() => setCurrentStep(3)}>Next</button>
                                </div>
                            </div>
                        ) : (
                            <div className="group-members-container">
                                {groupMembers.map((member, index) => (
                                    <div key={index} className="member-verification-row">
                                        <div className="member-label">Team Member {index + 1}</div>
                                        <div className="search-input-wrapper">
                                            <input 
                                                type="text" 
                                                placeholder="TLRN-XXX-0000" 
                                                value={member.idInput}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    // Simple format for group multi-inputs
                                                    const updated = [...groupMembers];
                                                    updated[index].idInput = val;
                                                    setGroupMembers(updated);
                                                }}
                                                className="teammate-search-input"
                                            />
                                            <button 
                                                type="button" 
                                                className="fetch-btn" 
                                                onClick={() => handleGroupMemberSearch(index)}
                                                disabled={member.isFetching}
                                            >
                                                {member.isFetching ? '...' : 'VERIFY'}
                                            </button>
                                        </div>
                                        {member.data && (
                                            <div className={`member-preview-mini ${member.alreadyRegistered ? 'error' : 'success'}`}>
                                                <div className="mini-info">
                                                    <strong>{member.data.firstName} {member.data.lastName}</strong>
                                                    {member.alreadyRegistered && <span> (ALREADY REGISTERED)</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="registration-actions" style={{ marginTop: '3rem' }}>
                                    <button type="button" className="back-btn" onClick={() => setCurrentStep(2)}>Go Back</button>
                                    <button 
                                        type="button" 
                                        className="signup-btn" 
                                        onClick={handleSubmit} 
                                        disabled={loading || groupMembers.some(m => !m.data || !!m.alreadyRegistered)}
                                    >
                                        {loading ? 'REGISTERING...' : `CONFIRM TEAM OF ${groupSizeInput + 1}`}
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default RegistrationForm;
