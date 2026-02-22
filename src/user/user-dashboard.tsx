import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp, getCountFromServer, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/toast/Toast';
import Masonry from '../components/gallery/Masonry';
import { competitionsData } from '../data/competitionsData';
import ModelPortal from '../components/modal/ModelPortal';
import ErrorBoundary from '../components/error-boundary/ErrorBoundary';
import './user-dashboard.css';

const UserDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { userProfile, currentUser, isAdmin, deleteAccount, reauthenticate, logout } = useAuth();
    const { showToast } = useToast();

    // Admin Redirect Guard
    useEffect(() => {
        if (isAdmin) {
            navigate('/admin-dashboard', { replace: true });
        }
    }, [isAdmin, navigate]);

    const [activeTab, setActiveTab] = useState('Overview');
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    
    // Live Data States
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeEvents: competitionsData.length,
        myEvents: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [editStatus, setEditStatus] = useState<'none' | 'pending' | 'approved'>('none');
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [editedData, setEditedData] = useState<any>(null);
    const [selectedReg, setSelectedReg] = useState<any | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Swipe logic state
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNextImage();
        } else if (isRightSwipe) {
            handlePrevImage();
        }
    };

    // Data Fetching
    useEffect(() => {
        const fetchData = async () => {
            if (!userProfile?.talentronId || !currentUser?.uid) return;
            setIsLoading(true);
            try {
                // 1. Fetch User Registrations
                const regsRef = collection(db, 'registrations');
                const userRegsQuery = query(
                    regsRef, 
                    where('tlrnId', '==', userProfile.talentronId),
                    orderBy('timestamp', 'desc')
                );
                const regsSnapshot = await getDocs(userRegsQuery);
                const regsData = regsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRegistrations(regsData);

                // 2. Fetch Global Stats for Overview (Efficient Aggregation)
                const usersCountSnap = await getCountFromServer(collection(db, 'users'));
                
                setStats({
                    totalStudents: usersCountSnap.data().count,
                    activeEvents: competitionsData.length,
                    myEvents: regsSnapshot.size
                });

                // 3. Fetch Edit Request Status
                const editRef = collection(db, 'profile_edit_requests');
                const editQuery = query(
                    editRef, 
                    where('userId', '==', currentUser.uid),
                    orderBy('timestamp', 'desc')
                );
                const editSnap = await getDocs(editQuery);
                if (!editSnap.empty) {
                    const latest = editSnap.docs[0].data();
                    // If latest is completed, we reset to none
                    if (latest.status === 'completed') {
                        setEditStatus('none');
                    } else {
                        setEditStatus(latest.status as any);
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        
        // Real-time Notifications Listener
        let unsubscribeNotifications: (() => void) | undefined;
        if (currentUser?.uid) {
            const notifQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', currentUser.uid),
                orderBy('timestamp', 'desc')
            );
            unsubscribeNotifications = onSnapshot(notifQuery, (snapshot) => {
                setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
        }

        return () => {
            if (unsubscribeNotifications) unsubscribeNotifications();
        };
    }, [userProfile, currentUser]);

    const markAllAsRead = async () => {
        if (!currentUser?.uid || notifications.length === 0) return;
        try {
            const batch = writeBatch(db);
            notifications.forEach(notif => {
                if (!notif.read) {
                    batch.update(doc(db, 'notifications', notif.id), { read: true });
                }
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    // Use real profile data and currentUser for photo
    const displayData = {
        firstName: userProfile?.firstName || "User",
        lastName: userProfile?.lastName || "",
        email: userProfile?.email || currentUser?.email || "",
        phone: userProfile?.phone || "",
        dob: userProfile?.dob || "",
        sex: userProfile?.sex || "",
        major: userProfile?.major || "",
        college: userProfile?.college || "",
        studentId: userProfile?.studentId || "",
        govId: userProfile?.govId || "",
        talentronId: userProfile?.talentronId || "TLRN-XXX-0000",
        photoURL: userProfile?.photoURL || currentUser?.photoURL // Prefer Google's photo
    };

    const galleryItems = [
        { id: "1", img: "https://picsum.photos/id/1015/1200/1800", url: "#", height: 900 },
        { id: "2", img: "https://picsum.photos/id/1011/1200/1500", url: "#", height: 750 },
        { id: "3", img: "https://picsum.photos/id/1020/1200/1600", url: "#", height: 800 },
        { id: "4", img: "https://picsum.photos/id/1025/1200/1700", url: "#", height: 850 },
        { id: "5", img: "https://picsum.photos/id/1035/1200/1400", url: "#", height: 700 },
        { id: "6", img: "https://picsum.photos/id/1040/1200/1900", url: "#", height: 950 },
        { id: "7", img: "https://picsum.photos/id/1043/1200/1600", url: "#", height: 800 },
        { id: "8", img: "https://picsum.photos/id/1050/1200/2000", url: "#", height: 1000 },
        { id: "9", img: "https://picsum.photos/id/1055/1200/1500", url: "#", height: 750 },
    ];

    const handleNextImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex + 1) % galleryItems.length);
        }
    };

    const handlePrevImage = () => {
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((selectedImageIndex - 1 + galleryItems.length) % galleryItems.length);
        }
    };

    const closeLightbox = () => setSelectedImageIndex(null);

    const handleRequestEdit = async (proposedData: any) => {
        try {
            setIsSaving(true);
            await addDoc(collection(db, 'profile_edit_requests'), {
                userId: currentUser?.uid,
                userName: `${userProfile?.firstName} ${userProfile?.lastName}`,
                talentronId: userProfile?.talentronId,
                proposedData: proposedData,
                status: 'pending',
                timestamp: serverTimestamp(),
                reason: 'Profile data update'
            });
            setEditStatus('pending');
            setEditedData(null);
            showToast("Changes submitted for Admin review!", "success");
        } catch (error) {
            console.error("Submission error:", error);
            showToast("Failed to submit changes.", "error");
        } finally {
            setIsSaving(false);
            setShowSaveConfirm(false);
        }
    };

    const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';
        if (val.length > 0) {
            let p1 = val.substring(0, 4).replace(/[0-9]/g, '');
            formatted += p1;
            if (val.length > 4) {
                formatted += '-';
                let p2 = val.substring(4, 7).replace(/[0-9]/g, '');
                formatted += p2;
                if (val.length > 7) {
                    formatted += '-';
                    let p3 = val.substring(7, 11).replace(/[A-Z]/g, '');
                    formatted += p3;
                }
            }
        }
        setDeleteConfirmInput(formatted.substring(0, 15));
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    <div className="overview-container">
                        <div className="overview-header">
                            <h1>Overview</h1>
                            <p>Track your competition journey and performance.</p>
                        </div>
                        <div className="stats-grid">
                            <div className="overview-stat-card yellow">
                                <h3>Total Students</h3>
                                <div className="stat-value">{stats.totalStudents.toLocaleString()}</div>
                            </div>
                            <div className="overview-stat-card pink">
                                <h3>Active Events</h3>
                                <div className="stat-value">{stats.activeEvents.toLocaleString()}</div>
                            </div>
                            <div className="overview-stat-card blue">
                                <h3>My Events</h3>
                                <div className="stat-value">{stats.myEvents.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                );
            case 'My Events':
                return (
                    <div className="events-view-container">
                        <div className="view-header">
                            <h1>My Events</h1>
                            <p>Manage your registrations and track competition schedules.</p>
                        </div>
                        {isLoading ? (
                            <div className="events-list-grid">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="event-item-card skeleton-pulse" style={{ height: '140px', opacity: 0.6 }}></div>
                                ))}
                            </div>
                        ) : registrations.length === 0 ? (
                            <div className="empty-state-container">
                                <div className="empty-state-icon">🎫</div>
                                <h2 className="empty-state-title">
                                    No Registrations Yet
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '0 auto 1rem' }}>
                                    You haven't registered for any competitions yet. Discover your passion and compete with the best!
                                </p>
                                <button 
                                    className="nav-cta-btn" 
                                    style={{ width: 'auto', display: 'inline-block', padding: '1.2rem 2.5rem', background: '#f0ff00', color: '#000', border: '3px solid #000', boxShadow: '8px 8px 0px #00d4ff' }}
                                    onClick={() => navigate('/competitions')}
                                >
                                    EXPLORE COMPETITIONS
                                </button>
                            </div>
                        ) : (
                            <div className="events-list-grid">
                                {registrations.map((reg, i) => (
                                    <div key={reg.id} className="event-item-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="event-info">
                                            <span className="event-category" style={{ color: '#f0ff00' }}>{reg.category}</span>
                                            <h3>{reg.competitionName}</h3>
                                        </div>
                                        <div className="event-action-row">
                                            <div className={`event-status-badge ${reg.status || 'pending'}`}>
                                                <div className="status-dot"></div>
                                                {reg.status === 'approved' ? 'APPROVED' : reg.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                                            </div>
                                            <button className="event-details-btn" onClick={() => setSelectedReg(reg)}>Details</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'Certificates':
                return (
                    <div className="certificates-view-container">
                        <div className="view-header">
                            <h1>Achievements</h1>
                            <p>Your official records of excellence and participation.</p>
                        </div>
                        <div className="certificates-grid">
                            {[
                                { title: "Frontend Excellence", issue: "Jan 2026", id: "TLRN-CERT-892" },
                                { title: "Python Masterclass", issue: "Dec 2025", id: "TLRN-CERT-441" },
                                { title: "Hackathon Finisher", issue: "Nov 2025", id: "TLRN-CERT-102" }
                            ].map((cert, i) => (
                                <div key={i} className="cert-item-card">
                                    <div className="cert-preview-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 15L15 12M15 12L12 9M15 12H9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="cert-details">
                                        <h3>{cert.title}</h3>
                                        <div className="cert-meta">
                                            <span>Issued: {cert.issue}</span>
                                            <span>ID: {cert.id}</span>
                                        </div>
                                    </div>
                                    <button className="cert-download-btn">DOWNLOAD PDF</button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'Gallery':
                return (
                    <div className="gallery-view-container">
                        <div className="view-header">
                            <h1>Event Gallery</h1>
                            <p>Relive the moments from past hackathons and workshops.</p>
                        </div>
                        <div className="masonry-wrapper">
                            <Masonry
                                items={galleryItems}
                                ease="power3.out"
                                duration={0.6}
                                stagger={0.05}
                                animateFrom="bottom"
                                scaleOnHover
                                hoverScale={0.95}
                                blurToFocus
                                colorShiftOnHover={false}
                                onItemClick={(_, index) => setSelectedImageIndex(index)}
                            />
                        </div>
                    </div>
                );
            case 'Settings':
                return (
                    <div className="settings-view-container">
                        <div className="view-header">
                            <h1>Settings</h1>
                            <p>Manage your account settings and preferences.</p>
                        </div>

                        <div className="settings-grid">
                            <div className="settings-section-card">
                                <div className="section-header-inline">
                                    <h2>Profile Information</h2>
                                    {editStatus === 'none' && !editedData && (
                                        <button className="request-edit-btn" onClick={() => setEditedData({...displayData})}>Edit Profile</button>
                                    )}
                                    {editStatus === 'pending' && (
                                        <span style={{ color: '#ffc800', fontWeight: 900, fontSize: '0.8rem' }}>REVIEW PENDING...</span>
                                    )}
                                    {editedData && (
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button className="request-edit-btn" style={{ background: '#f0ff00', color: '#000' }} onClick={() => setShowSaveConfirm(true)}>SUBMIT FOR REVIEW</button>
                                            <button className="request-edit-btn" style={{ background: '#333' }} onClick={() => setEditedData(null)}>CANCEL</button>
                                        </div>
                                    )}
                                </div>
                                <div className={`settings-form ${!editedData ? 'read-only-mode' : ''}`}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.firstName} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, firstName: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.lastName} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, lastName: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Email Address (Immutable)</label>
                                            <input type="email" defaultValue={displayData.email} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.phone} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.dob} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, dob: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Sex</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.sex} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, sex: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Major / Branch</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.major} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, major: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>College / Institution</label>
                                            <input 
                                                type="text" 
                                                defaultValue={displayData.college} 
                                                readOnly={!editedData}
                                                onChange={(e) => setEditedData({...editedData, college: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        {displayData.studentId && (
                                            <div className="form-group">
                                                <label>Student ID (PRN/Roll)</label>
                                                <input type="text" defaultValue={displayData.studentId} readOnly />
                                            </div>
                                        )}
                                        {displayData.govId && (
                                            <div className="form-group">
                                                <label>Government ID (Aadhaar/PAN)</label>
                                                <input type="text" defaultValue={displayData.govId} readOnly />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section-card">
                                <h2>Security</h2>
                                <div className="settings-actions">
                                    <p className="security-info">Permanent account deletion. This action cannot be undone.</p>
                                    <button 
                                        className="delete-account-btn"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                    >
                                        DELETE ACCOUNT
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="user-dashboard-root">
            <div className={`dashboard-container ${activeTab.toLowerCase().replace(' ', '-')}-active`}>
                <div className="dashboard-main-content">
                    <div className="user-profile-section">
                        <div className="avatar-circle">
                            {displayData.photoURL ? (
                                <img src={displayData.photoURL} alt="Profile" className="user-avatar-img" />
                            ) : (
                                <span>{displayData.firstName[0]}{displayData.lastName[0]}</span>
                            )}
                        </div>
                        <h2 className="user-name">{displayData.firstName} {displayData.lastName}</h2>
                        <p className="user-email">{displayData.email}</p>
                        <p className="user-id">{displayData.talentronId}</p>

                        <div className="notif-bell-container" onClick={() => { setShowNotifications(!showNotifications); markAllAsRead(); }}>
                            <div className={`notif-bell ${notifications.some(n => !n.read) ? 'has-new' : ''}`}>
                                🔔
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="notif-count">{notifications.filter(n => !n.read).length}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="nav-stack">
                            {['Overview', 'My Events', 'Certificates', 'Gallery', 'Settings'].map((tab) => (
                                <button 
                                    key={tab}
                                    className={`nav-cta-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button 
                                className="nav-cta-btn logout-btn" 
                                onClick={async () => {
                                    try {
                                        await logout();
                                        showToast("Logged out successfully.", "success");
                                    } catch (err) {
                                        showToast("Logout failed.", "error");
                                    }
                                }}
                            >
                                LOGOUT
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-right-panel">
                    <ErrorBoundary>
                        {renderContent()}
                    </ErrorBoundary>
                </div>
            </div>

            {/* Delete Account Modal Overlay */}
            {isDeleteModalOpen && (
                <div className="fullscreen-overlay delete-modal-overlay">
                    {!showFinalConfirm ? (
                        <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmInput(''); }}>&times;</button>
                            <div className="delete-modal-header">
                                <div className="warning-icon">!</div>
                                <h2>Delete Your Account?</h2>
                                <p>To confirm deletion, please type your unique User ID below:</p>
                                <div className="confirm-id-display">{displayData.talentronId}</div>
                            </div>
                            
                            <div className="delete-input-group">
                                <input 
                                    type="text" 
                                    placeholder="TLRN-XXX-0000"
                                    value={deleteConfirmInput}
                                    onChange={handleDeleteInputChange}
                                    className="confirm-input-field"
                                />
                                <span className="input-hint">Pattern: Letters-Letters-Numbers</span>
                            </div>

                            <button 
                                className={`modal-action-btn delete ${deleteConfirmInput === displayData.talentronId ? 'active' : ''}`}
                                disabled={deleteConfirmInput !== displayData.talentronId}
                                onClick={() => setShowFinalConfirm(true)}
                            >
                                DELETE PERMANENTLY
                            </button>
                        </div>
                    ) : (
                        <div className="delete-modal-card final-step" onClick={(e) => e.stopPropagation()}>
                            <div className="delete-modal-header">
                                <div className="warning-icon blink">!</div>
                                <h2>Final Confirmation</h2>
                                <p>Are you project-sure? All your data, certificates, and event history will be wiped forever.</p>
                            </div>
                            <div className="final-actions">
                                <button className="modal-action-btn cancel" onClick={() => setShowFinalConfirm(false)}>
                                    NO, TAKE ME BACK
                                </button>
                                <button className="modal-action-btn delete active" onClick={async () => {
                                    try {
                                        await deleteAccount();
                                        showToast("Account deleted successfully.", "success");
                                        setIsDeleteModalOpen(false);
                                    } catch (error: any) {
                                        if (error.message === 'RE_AUTH_REQUIRED') {
                                            showToast("Verification required. Please sign in again.", "warning");
                                            try {
                                                await reauthenticate();
                                                showToast("Identity verified! You can now delete your account.", "success");
                                            } catch (reauthErr) {
                                                showToast("Verification failed.", "error");
                                            }
                                        } else {
                                            showToast(error.message || "Failed to delete account.", "error");
                                        }
                                    }
                                }}>
                                    YES, DELETE EVERYTHING
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Notifications Modal Overlay */}
            {showNotifications && (
                <div className="fullscreen-overlay notif-overlay" onClick={() => setShowNotifications(false)}>
                    <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="notif-modal-header">
                            <h2>Notifications</h2>
                            <button className="notif-close" onClick={() => setShowNotifications(false)}>&times;</button>
                        </div>
                        <div className="notif-list">
                            {notifications.length === 0 ? (
                                <div className="no-notifs">No notifications yet.</div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`notif-item ${notif.type} ${notif.read ? 'read' : 'unread'}`}>
                                        <div className="notif-icon">
                                            {notif.type === 'success' ? '✅' : notif.type === 'error' ? '❌' : 'ℹ️'}
                                        </div>
                                        <div className="notif-content">
                                            <h4>{notif.title}</h4>
                                            <p>{notif.message}</p>
                                            <span className="notif-time">
                                                {notif.timestamp?.toDate ? notif.timestamp.toDate().toLocaleString() : 'Just now'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Fullscreen Lightbox Overlay */}
            {selectedImageIndex !== null && (
                <div 
                    className="fullscreen-overlay" 
                    onClick={closeLightbox}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button className="overlay-close" onClick={closeLightbox}>&times;</button>
                    <button className="overlay-nav prev" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>&#10094;</button>
                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        <img src={galleryItems[selectedImageIndex].img} alt="Gallery" className="full-res-img" />
                    </div>
                    <button className="overlay-nav next" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>&#10095;</button>
                </div>
            )}

            {/* Save Confirmation Modal */}
            {showSaveConfirm && (
                <div className="fullscreen-overlay delete-modal-overlay">
                    <div className="save-confirm-card">
                        <h2>Submit Changes?</h2>
                        <p>Your profile updates will be sent to the moderation team for verification. This usually takes less than 24 hours.</p>
                        <div className="save-cta-row">
                            <button className="modal-cta-btn secondary" onClick={() => setShowSaveConfirm(false)}>CANCEL</button>
                            <button 
                                className="modal-cta-btn primary" 
                                onClick={() => {
                                    handleRequestEdit(editedData);
                                    setShowSaveConfirm(false);
                                }}
                                disabled={isSaving}
                            >
                                {isSaving ? "SUBMITTING..." : "CONFIRM & SUBMIT"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Registration Detail Modal */}
            {selectedReg && (
                <ModelPortal 
                    isOpen={!!selectedReg} 
                    onClose={() => setSelectedReg(null)}
                    image={competitionsData.find(c => c.name === selectedReg.competitionName)?.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800"}
                >
                    <div className="reg-detail-modal-wrapper">
                        <div className="detail-header">
                            <span className="detail-cat">{selectedReg.category}</span>
                            <h1>{selectedReg.competitionName}</h1>
                            <div className={`detail-status-pill ${selectedReg.status || 'pending'}`}>
                                {selectedReg.status === 'approved' ? 'APPROVED' : selectedReg.status === 'rejected' ? 'REJECTED' : 'PENDING'}
                            </div>
                        </div>

                        <div className="detail-stats-grid">
                            <div className="detail-stat">
                                <label>Registration ID</label>
                                <span>{selectedReg.registrationId}</span>
                            </div>
                            <div className="detail-stat">
                                <label>Registered On</label>
                                <span>{selectedReg.timestamp?.toDate ? selectedReg.timestamp.toDate().toLocaleDateString() : 'Recent'}</span>
                            </div>
                        </div>

                        <div className="detail-participant-info">
                            <h3>Participant Details</h3>
                            <div className="participant-card">
                                <p><strong>Name:</strong> {selectedReg.fullName || `${selectedReg.firstName || ''} ${selectedReg.lastName || ''}`.trim() || 'N/A'}</p>
                                <p><strong>Email:</strong> {selectedReg.email}</p>
                                <p><strong>TLRN ID:</strong> {selectedReg.tlrnId}</p>
                            </div>
                        </div>

                        {selectedReg.teammate && (
                            <div className="detail-participant-info" style={{ marginTop: '1.5rem' }}>
                                <h3>Teammate Details</h3>
                                <div className="participant-card" style={{ boxShadow: '8px 10px 0px #00d4ff' }}>
                                    <p><strong>Name:</strong> {selectedReg.teammate.fullName || `${selectedReg.teammate.firstName || ''} ${selectedReg.teammate.lastName || ''}`.trim() || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedReg.teammate.email}</p>
                                    <p><strong>TLRN ID:</strong> {selectedReg.teammate.tlrnId}</p>
                                </div>
                            </div>
                        )}

                        <div className="detail-cta-row">
                            <button className="modal-cta-btn secondary" onClick={() => setSelectedReg(null)}>CLOSE</button>
                            <button className="modal-cta-btn primary" onClick={() => {
                                setSelectedReg(null);
                                navigate('/competitions');
                            }}>VIEW EVENT PAGE</button>
                        </div>
                    </div>
                </ModelPortal>
            )}
        </div>
    );
};

export default UserDashboard;
