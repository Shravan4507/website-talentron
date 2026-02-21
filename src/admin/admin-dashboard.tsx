import React, { useState } from 'react';
import Masonry from '../components/gallery/Masonry';
import { useToast } from '../components/toast/Toast';
import './admin-dashboard.css';

const AdminDashboard: React.FC = () => {
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

    // Mock Admin Data (Matching AdminSignup fields)
    const adminData = {
        firstName: "Vikram",
        lastName: "Deshmukh",
        email: "v.deshmukh@zcoer.in",
        phone: "+91 98220 12345",
        dob: "1985-05-20",
        sex: "Male",
        college: "Zeal Education Society's Zeal College of Engineering & Research, Narhe, Pune",
        major: "Information Technology",
        yearOfStudy: "Faculty / Staff",
        division: "Admin-A",
        zprn: "ADM-998877",
        rollNo: "STF-001",
        userId: "TLRN-ADM-0001"
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
        let formatted = '';
        if (val.length > 0) {
            formatted += val.substring(0, 4).replace(/[0-9]/g, '');
            if (val.length > 4) {
                formatted += '-';
                formatted += val.substring(4, 7).replace(/[0-9]/g, '');
                if (val.length > 7) {
                    formatted += '-';
                    formatted += val.substring(7, 11).replace(/[A-Z]/g, '');
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
                        <div className="view-header">
                            <h1>Admin Overview</h1>
                            <p>System-wide performance and administrative stats.</p>
                        </div>
                        <div className="stats-grid">
                            <div className="overview-stat-card">
                                <h3>Total Users</h3>
                                <div className="stat-value">5,840</div>
                            </div>
                            <div className="overview-stat-card">
                                <h3>Active Events</h3>
                                <div className="stat-value">24</div>
                            </div>
                            <div className="overview-stat-card">
                                <h3>Submissions</h3>
                                <div className="stat-value">412</div>
                            </div>
                        </div>
                    </div>
                );
            case 'Events':
                return (
                    <div className="events-view-container">
                        <div className="view-header">
                            <h1>Manage Events</h1>
                            <p>Create, edit, and oversee all Talentron competitions.</p>
                        </div>
                        <div className="events-list-grid">
                            {[
                                { title: "Nexus Hackathon 2026", cat: "Competition", date: "March 15-17", status: "Active", color: "#00ff88" },
                                { title: "AI/ML Workshop", cat: "Learning", date: "February 28", status: "Upcoming", color: "#ff0059" },
                                { title: "Capture The Flag", cat: "Security", date: "April 05", status: "Review", color: "#00d4ff" }
                            ].map((event, i) => (
                                <div key={i} className="event-item-card">
                                    <div className="event-info">
                                        <span className="event-category" style={{ color: event.color }}>{event.cat}</span>
                                        <h3>{event.title}</h3>
                                        <p className="event-date">{event.date}</p>
                                    </div>
                                    <div className="event-action-row">
                                        <div className="event-status" style={{ background: `${event.color}15`, color: event.color }}>{event.status}</div>
                                        <button className="event-details-btn">Manage</button>
                                    </div>
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
                            <p>Manage community media and event highlights.</p>
                        </div>
                        <div className="masonry-wrapper">
                            <Masonry 
                                items={galleryItems} 
                                onItemClick={(_, index) => setSelectedImageIndex(index)}
                            />
                        </div>
                    </div>
                );
            case 'Settings':
                return (
                    <div className="settings-view-container">
                        <div className="view-header">
                            <h1>Admin Settings</h1>
                            <p>Manage your administrative profile and security.</p>
                        </div>
                        <div className="settings-grid">
                            <div className="settings-section-card">
                                <div className="section-header-inline">
                                    <h2>Admin Profile</h2>
                                    <button className="request-edit-btn">Edit Profile</button>
                                </div>
                                <div className="settings-form read-only-mode">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input type="text" defaultValue={adminData.firstName} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input type="text" defaultValue={adminData.lastName} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" defaultValue={adminData.email} readOnly />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="text" defaultValue={adminData.phone} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input type="text" defaultValue={adminData.dob} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Sex</label>
                                            <input type="text" defaultValue={adminData.sex} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Department / Major</label>
                                            <input type="text" defaultValue={adminData.major} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Designation / Year</label>
                                            <input type="text" defaultValue={adminData.yearOfStudy} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Division</label>
                                            <input type="text" defaultValue={adminData.division} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>ZPRN Number</label>
                                            <input type="text" defaultValue={adminData.zprn} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Roll / Staff ID</label>
                                            <input type="text" defaultValue={adminData.rollNo} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="settings-section-card">
                                <h2>Security</h2>
                                <div className="settings-actions">
                                    <p className="security-info">Permanent admin account deletion. All records will be wiped.</p>
                                    <button className="delete-account-btn" onClick={() => setIsDeleteModalOpen(true)}>
                                        DELETE ADMIN ACCOUNT
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
        <div className="admin-dashboard-root">
            <div className={`dashboard-container ${activeTab.toLowerCase().replace(' ', '-')}-active`}>
                <div className="dashboard-main-content">
                    <div className="user-profile-section">
                        <div className="avatar-circle">
                            <span>{adminData.firstName[0]}{adminData.lastName[0]}</span>
                        </div>
                        <h2 className="user-name">{adminData.firstName} {adminData.lastName}</h2>
                        <p className="user-email">{adminData.email}</p>
                        <p className="user-id">{adminData.userId}</p>
                        
                        <div className="nav-stack">
                            {['Overview', 'Events', 'Gallery', 'Settings'].map((tab) => (
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

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <div className="fullscreen-overlay delete-modal-overlay">
                    {!showFinalConfirm ? (
                        <div className="delete-modal-card">
                            <button className="modal-close" onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmInput(''); }}>&times;</button>
                            <div className="delete-modal-header">
                                <div className="warning-icon">!</div>
                                <h2>Delete Admin?</h2>
                                <p>Type your Admin ID to confirm:</p>
                                <div className="confirm-id-display">{adminData.userId}</div>
                            </div>
                            <div className="delete-input-group">
                                <input 
                                    type="text" 
                                    placeholder="TLRN-ADM-0000"
                                    value={deleteConfirmInput}
                                    onChange={handleDeleteInputChange}
                                    className="confirm-input-field"
                                />
                            </div>
                            <button 
                                className={`modal-action-btn delete ${deleteConfirmInput === adminData.userId ? 'active' : ''}`}
                                disabled={deleteConfirmInput !== adminData.userId}
                                onClick={() => setShowFinalConfirm(true)}
                            >
                                DELETE PERMANENTLY
                            </button>
                        </div>
                    ) : (
                        <div className="delete-modal-card">
                            <div className="delete-modal-header">
                                <div className="warning-icon blink">!</div>
                                <h2>Final Warning</h2>
                                <p>Are you sure? This action is irreversible for administrator privileges.</p>
                            </div>
                            <div className="final-actions">
                                <button className="modal-action-btn cancel" onClick={() => setShowFinalConfirm(false)}>CANCEL</button>
                                <button className="modal-action-btn delete active" onClick={() => {
                                    showToast("Admin account deleted.", "success");
                                    setIsDeleteModalOpen(false);
                                }}>CONFIRM DELETE</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {selectedImageIndex !== null && (
                <div 
                    className="fullscreen-overlay" 
                    onClick={closeLightbox}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button className="overlay-close" onClick={closeLightbox}>&times;</button>
                    <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                        <img src={galleryItems[selectedImageIndex].img} className="full-res-img" alt="Fullscreen" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
