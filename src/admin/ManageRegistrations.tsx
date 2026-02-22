import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useToast } from '../components/toast/Toast';
import { logAdminAction } from '../utils/auditLogger';
import { sendNotification } from '../utils/notifier';
import * as XLSX from 'xlsx';
import './admin-dashboard.css'; // Reuse dashboard styles for consistency
import './ManageRegistrations.css';

const CATEGORIES = [
    'All',
    'Music',
    'Dance',
    'Dramatics',
    'Speaking Arts',
    'Fine Arts',
    'Digital Arts',
    'Fashion and Lifestyle'
];

const ManageRegistrations: React.FC = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedReg, setSelectedReg] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { showToast } = useToast();
    
    const permissions = userProfile?.permissions || [];
    const isAuthorized = permissions.includes('super_admin') || permissions.includes('manage_registrations');

    useEffect(() => {
        if (isAuthorized) {
            fetchRegistrations();
        }
    }, [isAuthorized, activeCategory]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const regsRef = collection(db, 'registrations');
            let q;
            
            if (activeCategory === 'All') {
                q = query(regsRef, orderBy('timestamp', 'desc'), limit(100));
            } else {
                q = query(
                    regsRef, 
                    where('category', '==', activeCategory), 
                    orderBy('timestamp', 'desc'),
                    limit(100)
                );
            }
            
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRegistrations(data);
            setSelectedIds(new Set()); // Reset selection on refresh or category change
        } catch (error) {
            console.error("Error fetching registrations:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedIds.size === registrations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(registrations.map(r => r.id)));
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        // Optimistic UI Update
        const previousRegistrations = [...registrations];
        setRegistrations(prev => 
            prev.map(reg => reg.id === id ? { ...reg, status: newStatus } : reg)
        );
        
        setIsUpdating(true);
        try {
            const regRef = doc(db, 'registrations', id);
            await updateDoc(regRef, { 
                status: newStatus,
                updatedAt: new Date().toISOString()
            });

            // Log Action
            const targetReg = previousRegistrations.find(r => r.id === id);
            await logAdminAction({
                adminId: userProfile?.uid || 'Unknown',
                adminName: `${userProfile?.firstName} ${userProfile?.lastName}`,
                action: newStatus === 'approved' ? 'APPROVE_REGISTRATION' : 'REJECT_REGISTRATION',
                targetId: id,
                targetName: targetReg?.fullName || 'Unknown Participant',
                details: `Event: ${targetReg?.competitionName}`
            });

            // Send Notification to User
            if (targetReg?.userId) {
                await sendNotification({
                    userId: targetReg.userId,
                    title: `Registration ${newStatus.toUpperCase()}`,
                    message: `Your registration for "${targetReg.competitionName}" has been ${newStatus}.`,
                    type: newStatus === 'approved' ? 'success' : 'error',
                    link: '/dashboard'
                });
            }
            
            showToast(`Registration ${newStatus} successfully!`, "success");
            setSelectedReg(null);
            // We don't necessarily need to fetchRegistrations() immediately if state is already updated correctly,
            // but for safety with multiple admins, we can do it.
        } catch (error) {
            console.error("Update error:", error);
            // Rollback on error
            setRegistrations(previousRegistrations);
            showToast("Failed to update registration status.", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBulkAction = async (action: 'approved' | 'rejected' | 'delete') => {
        if (selectedIds.size === 0) return;
        if (action === 'delete' && !window.confirm(`Are you SURE you want to permanently delete ${selectedIds.size} records? This cannot be undone.`)) return;

        setIsUpdating(true);
        const batch = writeBatch(db);
        const idsArray = Array.from(selectedIds);
        const selectedRecords = registrations.filter(r => selectedIds.has(r.id));

        try {
            for (const id of idsArray) {
                const regRef = doc(db, 'registrations', id);
                if (action === 'delete') {
                    batch.delete(regRef);
                } else {
                    batch.update(regRef, { 
                        status: action,
                        updatedAt: new Date().toISOString()
                    });
                }
            }

            await batch.commit();

            // Handle logging and notifications after successful batch
            for (const reg of selectedRecords) {
                // Log Action
                await logAdminAction({
                    adminId: userProfile?.uid || 'Unknown',
                    adminName: `${userProfile?.firstName} ${userProfile?.lastName}`,
                    action: action === 'delete' ? 'DELETE_REGISTRATION' : (action === 'approved' ? 'APPROVE_REGISTRATION' : 'REJECT_REGISTRATION'),
                    targetId: reg.id,
                    targetName: reg.fullName || 'Unknown Participant',
                    details: `Bulk Action: ${action.toUpperCase()} | Event: ${reg.competitionName}`
                });

                // Send Notification (only for status changes)
                if (action !== 'delete' && reg.userId) {
                    await sendNotification({
                        userId: reg.userId,
                        title: `Registration ${action.toUpperCase()}`,
                        message: `Your registration for "${reg.competitionName}" has been ${action} via bulk update.`,
                        type: action === 'approved' ? 'success' : 'error',
                        link: '/dashboard'
                    });
                }
            }

            showToast(`Bulk ${action} completed for ${selectedIds.size} records.`, "success");
            setSelectedIds(new Set());
            fetchRegistrations(); // Refresh data to show final state
        } catch (error) {
            console.error("Bulk action error:", error);
            showToast("Failed to complete bulk action.", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteRegistration = async (id: string) => {
        const targetReg = registrations.find(r => r.id === id);
        if (!window.confirm(`Permanently delete registration for ${targetReg?.fullName}?`)) return;

        setIsUpdating(true);
        try {
            await deleteDoc(doc(db, 'registrations', id));

            await logAdminAction({
                adminId: userProfile?.uid || 'Unknown',
                adminName: `${userProfile?.firstName} ${userProfile?.lastName}`,
                action: 'DELETE_REGISTRATION',
                targetId: id,
                targetName: targetReg?.fullName || 'Unknown Participant',
                details: `Deleted registration record for ${targetReg?.competitionName}`
            });

            showToast("Registration deleted successfully.", "success");
            setSelectedReg(null);
            fetchRegistrations();
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Failed to delete registration.", "error");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExport = async (format: 'csv' | 'xlsx' | 'json') => {
        setIsExporting(true);
        setShowExportMenu(false);
        try {
            // Fetch ALL registrations for the current category (no limit)
            const regsRef = collection(db, 'registrations');
            let q;
            if (activeCategory === 'All') {
                q = query(regsRef, orderBy('timestamp', 'desc'));
            } else {
                q = query(regsRef, where('category', '==', activeCategory), orderBy('timestamp', 'desc'));
            }
            
            const snapshot = await getDocs(q);
            const allData = snapshot.docs.map(doc => {
                const data = doc.data();
                // Flatten structural data for spreadsheet readability
                const flattened: any = {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp ? new Date(data.timestamp).toLocaleString() : '',
                    updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleString() : ''
                };

                // If teammate exists, flatten their fields
                if (data.teammate) {
                    flattened.teammate_fullName = data.teammate.fullName;
                    flattened.teammate_email = data.teammate.email;
                    flattened.teammate_tlrnId = data.teammate.tlrnId;
                    flattened.teammate_phone = data.teammate.phone;
                    flattened.teammate_whatsapp = data.teammate.whatsapp;
                    flattened.teammate_college = data.teammate.college;
                    delete flattened.teammate;
                }

                return flattened;
            });

            const fileName = `Talentron_Registrations_${activeCategory}_${new Date().toISOString().split('T')[0]}`;

            if (format === 'json') {
                const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.json`;
                a.click();
            } else {
                const worksheet = XLSX.utils.json_to_sheet(allData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
                
                if (format === 'csv') {
                    XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
                } else {
                    XLSX.writeFile(workbook, `${fileName}.xlsx`);
                }
            }

            showToast(`Exported ${allData.length} records to ${format.toUpperCase()}`, "success");
            
            // Log Export Action
            await logAdminAction({
                adminId: userProfile?.uid || 'Unknown',
                adminName: `${userProfile?.firstName} ${userProfile?.lastName}`,
                action: 'EXPORT_REGISTRATIONS' as any,
                targetId: activeCategory,
                targetName: `Category: ${activeCategory}`,
                details: `Format: ${format}, Count: ${allData.length}`
            });

        } catch (error) {
            console.error("Export error:", error);
            showToast("Failed to export registrations.", "error");
        } finally {
            setIsExporting(false);
        }
    };

    if (!isAuthorized) {
        return <Navigate to="/admin-dashboard" replace />;
    }

    return (
        <div className="admin-dashboard-root">
            <div className="dashboard-container registrations-active">
                {/* Left Panel - Navigation */}
                <div className="dashboard-left-panel">
                    <div className="admin-profile-card">
                        <div className="user-avatar-placeholder">
                            <span>REG</span>
                        </div>
                        <h2 className="user-name">Filter By</h2>
                        <p className="user-email">Category Wise View</p>
                        
                        <div className="nav-stack">
                            {CATEGORIES.map((cat) => (
                                <button 
                                    key={cat}
                                    className={`nav-cta-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Content */}
                <div className="dashboard-right-panel">
                    <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h1 style={{ color: '#ffc800', fontSize: '3.5rem', fontWeight: 950, textTransform: 'uppercase', lineHeight: 1 }}>
                                {activeCategory}
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
                                Showing {registrations.length} registrations for {activeCategory} category.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="nav-cta-btn"
                                    style={{ width: 'auto', padding: '0.8rem 2rem', background: '#00ff88', color: '#000', border: '3px solid #000', boxShadow: '5px 5px 0px #000' }}
                                    disabled={isExporting}
                                >
                                    {isExporting ? 'PREPARING...' : 'EXPORT DATA ▼'}
                                </button>
                                {showExportMenu && (
                                    <div className="export-dropdown">
                                        <div className="export-option" onClick={() => handleExport('csv')}>DOWNLOAD CSV</div>
                                        <div className="export-option" onClick={() => handleExport('xlsx')}>DOWNLOAD EXCEL</div>
                                        <div className="export-option" onClick={() => handleExport('json')}>DOWNLOAD JSON</div>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => navigate('/admin-dashboard')}
                                className="nav-cta-btn"
                                style={{ width: 'auto', padding: '0.8rem 2rem' }}
                            >
                                <span>←</span> DASHBOARD
                            </button>
                        </div>
                    </div>

                    {/* Selection Controls */}
                    {registrations.length > 0 && (
                        <div className="selection-actions-bar" style={{ 
                            marginBottom: '2rem', 
                            padding: '1.5rem 2rem', 
                            background: '#000', 
                            border: '4px solid #000', 
                            borderRadius: '1.5rem', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            boxShadow: '8px 8px 0px #333'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <label className="check-container" style={{ margin: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.size === registrations.length && registrations.length > 0} 
                                        onChange={selectAll} 
                                    />
                                    <span className="checkmark"></span>
                                </label>
                                <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#fff' }}>
                                    {selectedIds.size === 0 ? 'SELECT ALL ENTRIES' : `${selectedIds.size} ITEMS SELECTED`}
                                </span>
                            </div>

                            {selectedIds.size > 0 && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button 
                                        className="bulk-btn approve" 
                                        onClick={() => handleBulkAction('approved')}
                                        disabled={isUpdating}
                                    >
                                        APPROVE SELECTED
                                    </button>
                                    <button 
                                        className="bulk-btn reject" 
                                        onClick={() => handleBulkAction('rejected')}
                                        disabled={isUpdating}
                                    >
                                        REJECT SELECTED
                                    </button>
                                    <button 
                                        className="bulk-btn delete" 
                                        onClick={() => handleBulkAction('delete')}
                                        disabled={isUpdating}
                                    >
                                        DELETE
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="registrations-list compact-view">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="registration-data-card compact skeleton-pulse" style={{ height: '100px', opacity: 0.5 }}></div>
                            ))}
                        </div>
                    ) : registrations.length === 0 ? (
                        <div style={{ 
                            padding: '4rem', 
                            border: '4px dashed #333', 
                            borderRadius: '2rem',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)'
                        }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕳️</div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                                No Registrations Found
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '1rem auto' }}>
                                No students have registered for {activeCategory} competitions yet.
                            </p>
                        </div>
                    ) : (
                        <div className="registrations-list compact-view">
                            {registrations.map((reg) => (
                                <div key={reg.id} className={`registration-data-card compact ${selectedIds.has(reg.id) ? 'selected' : ''}`}>
                                    <div style={{ display: 'flex', alignItems: 'center', paddingRight: '1rem' }}>
                                        <label className="check-container">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.has(reg.id)} 
                                                onChange={() => toggleSelection(reg.id)} 
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </div>
                                    <div className="reg-card-main">
                                        <div className="reg-event-info">
                                            <span className="reg-badge">{reg.teamSize}</span>
                                            <h3>{reg.competitionName}</h3>
                                            <span className="reg-category-pill">{reg.category}</span>
                                        </div>
                                        
                                        <div className="reg-person-brief">
                                            <div className="brief-item">
                                                <label>Lead Participant</label>
                                                <span>{reg.fullName}</span>
                                            </div>
                                            {reg.teammate && (
                                                <div className="brief-item">
                                                    <label>Teammate</label>
                                                    <span>{reg.teammate.fullName}</span>
                                                </div>
                                            )}
                                            <div className="brief-item">
                                                <label>College</label>
                                                <span>{reg.college}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="reg-card-actions">
                                        <div className="time-status">
                                            <span className="reg-time-brief">{new Date(reg.timestamp).toLocaleDateString()}</span>
                                            <span className={`status-indicator ${reg.status || 'pending'}`}>
                                                {reg.status ? reg.status.toUpperCase() : 'PENDING'}
                                            </span>
                                        </div>
                                        <button className="view-details-btn compact" onClick={() => setSelectedReg(reg)}>
                                            VIEW FULL DATA
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Details Modal */}
            {selectedReg && (
                <div className="fullscreen-overlay details-modal-overlay">
                    <div className="details-modal-card">
                        <div className="modal-header-pop">
                            <div className="header-event-info">
                                <span className="category-pill-large">{selectedReg.category}</span>
                                <h1>{selectedReg.competitionName}</h1>
                                <p className="reg-id-badge">ID: {selectedReg.registrationId}</p>
                            </div>
                            <button className="close-modal-btn" onClick={() => setSelectedReg(null)}>✕</button>
                        </div>

                        <div className="modal-scroll-content">
                            <div className="details-grid-pop">
                                {/* Lead Participant Section */}
                                <div className="details-section-pop lead-section">
                                    <h2 className="section-title-pop">Lead Participant</h2>
                                    <div className="data-row-pop">
                                        <div className="data-item-pop">
                                            <label>Full Name</label>
                                            <p>{selectedReg.fullName}</p>
                                        </div>
                                        <div className="data-item-pop">
                                            <label>TLRN ID</label>
                                            <p className="highlight-text">{selectedReg.tlrnId}</p>
                                        </div>
                                    </div>
                                    <div className="data-row-pop">
                                        <div className="data-item-pop">
                                            <label>College</label>
                                            <p>{selectedReg.college}</p>
                                        </div>
                                        <div className="data-item-pop">
                                            <label>Email Address</label>
                                            <p>{selectedReg.email}</p>
                                        </div>
                                    </div>
                                    <div className="data-row-pop">
                                        <div className="data-item-pop">
                                            <label>Phone Number</label>
                                            <p>{selectedReg.phone}</p>
                                        </div>
                                        <div className="data-item-pop">
                                            <label>WhatsApp Number</label>
                                            <p>{selectedReg.whatsapp}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Teammate Section if Duo */}
                                {selectedReg.teammate && (
                                    <div className="details-section-pop teammate-section">
                                        <h2 className="section-title-pop">Teammate Details</h2>
                                        <div className="data-row-pop">
                                            <div className="data-item-pop">
                                                <label>Full Name</label>
                                                <p>{selectedReg.teammate.fullName}</p>
                                            </div>
                                            <div className="data-item-pop">
                                                <label>TLRN ID</label>
                                                <p className="highlight-text">{selectedReg.teammate.tlrnId}</p>
                                            </div>
                                        </div>
                                        <div className="data-row-pop">
                                            <div className="data-item-pop">
                                                <label>College</label>
                                                <p>{selectedReg.teammate.college || selectedReg.college}</p>
                                            </div>
                                            <div className="data-item-pop">
                                                <label>Email Address</label>
                                                <p>{selectedReg.teammate.email}</p>
                                            </div>
                                        </div>
                                        <div className="data-row-pop">
                                            <div className="data-item-pop">
                                                <label>Teammate Phone</label>
                                                <p>{selectedReg.teammate.phone || 'N/A'}</p>
                                            </div>
                                            <div className="data-item-pop">
                                                <label>Teammate WhatsApp</label>
                                                <p>{selectedReg.teammate.whatsapp || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata Section */}
                                <div className="details-section-pop meta-section">
                                    <h2 className="section-title-pop">Registration Metadata</h2>
                                    <div className="data-row-pop">
                                        <div className="data-item-pop">
                                            <label>Team Size</label>
                                            <p>{selectedReg.teamSize}</p>
                                        </div>
                                        <div className="data-item-pop">
                                            <label>Timestamp</label>
                                            <p>{new Date(selectedReg.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="data-item-pop">
                                            <label>Current Status</label>
                                            <p className={`status-label ${selectedReg.status || 'pending'}`}>
                                                {selectedReg.status ? selectedReg.status.toUpperCase() : 'PENDING APPROVAL'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-pop">
                            <button 
                                className="action-btn-pop approve" 
                                onClick={() => handleStatusUpdate(selectedReg.id, 'approved')}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Approve Registration'}
                            </button>
                            <button 
                                className="action-btn-pop reject" 
                                onClick={() => handleStatusUpdate(selectedReg.id, 'rejected')}
                                disabled={isUpdating}
                            >
                                Reject
                            </button>
                            <button 
                                className="action-btn-pop delete-mini" 
                                onClick={() => handleDeleteRegistration(selectedReg.id)}
                                disabled={isUpdating}
                                style={{ flex: '0 0 auto', padding: '1.5rem', width: 'auto' }}
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRegistrations;
