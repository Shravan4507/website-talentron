import React, { useState } from 'react';
import Masonry from '../components/gallery/Masonry';
import { useToast } from '../components/toast/Toast';
import './user-dashboard.css';

const UserDashboard: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('Overview');
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    
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

    // Mock User Data for demonstration (Matching UserSignup fields)
    const userData = {
        firstName: "Aryan",
        lastName: "Sharma",
        email: "aryan.s@zcoer.in",
        phone: "+91 98765 43210",
        dob: "2005-08-15",
        sex: "Male",
        major: "Computer Engineering",
        college: "Zeal College of Engineering and Research",
        studentId: "PRN-12345678", // Optional
        govId: "XXXX XXXX 1234",   // Optional
        userId: "TLRN-ARY-0001"
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

    const handleDeleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        // Pattern: TLRN-AAA-0000
        let formatted = '';
        if (val.length > 0) {
            // First part: TLRN
            let p1 = val.substring(0, 4).replace(/[^A-Y]/g, ''); // Simplified for TLRN
            // Actually, let's just force the first 4 to be letters
            p1 = val.substring(0, 4).replace(/[0-9]/g, '');
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
        setDeleteConfirmInput(formatted.substring(0, 15)); // TLRN-AAA-0000 is 13 chars, but let's be safe
    };

    const renderContent = () => {
        switch (activeTab) {
            // ... Overview case remains same ...
            case 'Overview':
                return (
                    <div className="overview-container">
                        <div className="overview-header">
                            <h1>Overview</h1>
                            <p>Track your competition journey and performance.</p>
                        </div>
                        <div className="stats-grid">
                            <div className="overview-stat-card">
                                <h3>Total Points</h3>
                                <div className="stat-value">2,450</div>
                            </div>
                            <div className="overview-stat-card">
                                <h3>Events Joined</h3>
                                <div className="stat-value">12</div>
                            </div>
                            <div className="overview-stat-card">
                                <h3>Ranking</h3>
                                <div className="stat-value">#14</div>
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
                        <div className="events-list-grid">
                            {[
                                { title: "Nexus Hackathon 2026", cat: "Competition", date: "March 15-17", status: "Registered", color: "#00ff88" },
                                { title: "AI/ML Workshop", cat: "Learning", date: "February 28", status: "Joined", color: "#ff0059" },
                                { title: "Capture The Flag", cat: "Security", date: "April 05", status: "Upcoming", color: "#00d4ff" }
                            ].map((event, i) => (
                                <div key={i} className="event-item-card">
                                    <div className="event-info">
                                        <span className="event-category" style={{ color: event.color }}>{event.cat}</span>
                                        <h3>{event.title}</h3>
                                        <p className="event-date">{event.date}</p>
                                    </div>
                                    <div className="event-action-row">
                                        <div className="event-status" style={{ background: `${event.color}15`, color: event.color }}>{event.status}</div>
                                        <button className="event-details-btn">Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                    <button className="request-edit-btn">Request Profile Edit</button>
                                </div>
                                <div className="settings-form read-only-mode">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input type="text" defaultValue={userData.firstName} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input type="text" defaultValue={userData.lastName} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" defaultValue={userData.email} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="text" defaultValue={userData.phone} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input type="text" defaultValue={userData.dob} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Sex</label>
                                            <input type="text" defaultValue={userData.sex} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Major / Branch</label>
                                            <input type="text" defaultValue={userData.major} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>College / Institution</label>
                                            <input type="text" defaultValue={userData.college} readOnly />
                                        </div>
                                    </div>

                                    {/* Optional Fields - Only show if they have values from Signup */}
                                    <div className="form-row">
                                        {userData.studentId && (
                                            <div className="form-group">
                                                <label>Student ID (PRN/Roll)</label>
                                                <input type="text" defaultValue={userData.studentId} readOnly />
                                            </div>
                                        )}
                                        {userData.govId && (
                                            <div className="form-group">
                                                <label>Government ID (Aadhaar/PAN)</label>
                                                <input type="text" defaultValue={userData.govId} readOnly />
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
                            <span>AS</span>
                        </div>
                        <h2 className="user-name">Aryan Sharma</h2>
                        <p className="user-email">aryan.s@zcoer.in</p>
                        <p className="user-id">{userData.userId}</p>
                        
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
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-right-panel">
                    {renderContent()}
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
                                <div className="confirm-id-display">{userData.userId}</div>
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
                                className={`modal-action-btn delete ${deleteConfirmInput === userData.userId ? 'active' : ''}`}
                                disabled={deleteConfirmInput !== userData.userId}
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
                                <button className="modal-action-btn delete active" onClick={() => {
                                    showToast("Account deleted successfully.", "success");
                                    setIsDeleteModalOpen(false);
                                }}>
                                    YES, DELETE EVERYTHING
                                </button>
                            </div>
                        </div>
                    )}
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
                    
                    <button className="overlay-nav prev" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>
                        &#10094;
                    </button>
                    
                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={galleryItems[selectedImageIndex].img} 
                            alt={`Gallery item ${selectedImageIndex}`} 
                            className="full-res-img"
                        />
                    </div>

                    <button className="overlay-nav next" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>
                        &#10095;
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
