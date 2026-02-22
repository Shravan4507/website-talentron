import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Masonry from '../components/gallery/Masonry';
import { useToast } from '../components/toast/Toast';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where, updateDoc, serverTimestamp, getCountFromServer, limit, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import AdminSignupForm from '../components/forms/AdminSignupForm';
import UserSignupForm from '../components/forms/UserSignupForm';
import ErrorBoundary from '../components/error-boundary/ErrorBoundary';
import { logAdminAction } from '../utils/auditLogger';
import { sendNotification } from '../utils/notifier';
import { competitionsData } from '../data/competitionsData';
import * as XLSX from 'xlsx';
import './admin-dashboard.css';

const AdminDashboard: React.FC = () => {
    const { userProfile, currentUser, logout, deleteAccount, reauthenticate } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('Overview');
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editModal, setEditModal] = useState<{data: any, type: 'admins' | 'users'} | null>(null);
    
    // Super Admin Data States
    const [adminsList, setAdminsList] = React.useState<any[]>([]);
    const [usersList, setUsersList] = React.useState<any[]>([]);
    const [isFetchingData, setIsFetchingData] = React.useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [profileRequests, setProfileRequests] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState<{type: 'admins' | 'users' | null}>({type: null});
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRegistrations: 0,
        activeEvents: competitionsData.length
    });

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

    // Use real data from profile
    const displayData = React.useMemo(() => ({
        firstName: userProfile?.firstName || "Admin",
        lastName: userProfile?.lastName || "",
        email: userProfile?.email || currentUser?.email || "",
        phone: userProfile?.phone || "Not Set",
        dob: userProfile?.dob || "Not Set",
        sex: userProfile?.sex || "Not Set",
        college: userProfile?.college || "ZCOER",
        major: userProfile?.major || "Administration",
        yearOfStudy: userProfile?.yearOfStudy || "Staff",
        division: userProfile?.division || "N/A",
        zprn: userProfile?.zprn || "N/A",
        rollNo: userProfile?.rollNo || userProfile?.adminId || "N/A",
        talentronId: userProfile?.adminId || "N/A",
        photoURL: currentUser?.photoURL,
        permissions: userProfile?.permissions || []
    }), [userProfile, currentUser]);

    const isSuperAdmin = displayData.permissions.includes('super_admin');
    const canManageRegistrations = isSuperAdmin || displayData.permissions.includes('manage_registrations');
    const canManageProfileEdits = isSuperAdmin || displayData.permissions.includes('manage_profile_edits');
    
    const tabs = isSuperAdmin 
        ? ['Overview', 'Search', 'Admins', 'Users', 'Registrations', 'Profile Edits', 'System Logs', 'Settings'] 
        : (canManageRegistrations 
            ? ['Overview', 'Events', 'Gallery', 'Registrations', 'Profile Edits', 'Settings']
            : (canManageProfileEdits
                ? ['Overview', 'Profile Edits', 'Settings']
                : ['Overview', 'Events', 'Gallery', 'Settings']));

    // Data Fetching for Super Admin
    React.useEffect(() => {
        if (isSuperAdmin && (activeTab === 'Admins' || activeTab === 'Users' || activeTab === 'Search')) {
            setSelectedIds(new Set()); // Reset selection when switching tabs
            fetchSuperAdminData();
        }
        if (activeTab === 'Overview') {
            fetchStats();
        }
        if (activeTab === 'Profile Edits') {
            fetchProfileRequests();
        }
        if (activeTab === 'System Logs') {
            fetchAuditLogs();
        }
    }, [activeTab, isSuperAdmin]);

    const fetchAuditLogs = async () => {
        setIsFetchingData(true);
        try {
            const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            setAuditLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            showToast("Failed to load audit logs.", "error");
        } finally {
            setIsFetchingData(false);
        }
    };

    const fetchProfileRequests = async () => {
        setIsFetchingData(true);
        try {
            const q = query(collection(db, 'profile_edit_requests'), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            setProfileRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching profile requests:", error);
            showToast("Failed to load requests.", "error");
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleApproveRequest = async (requestId: string) => {
        const request = profileRequests.find(r => r.id === requestId);
        if (!request || !request.userId || !request.proposedData) {
            showToast("Invalid request data.", "error");
            return;
        }

        try {
            // 1. Update the actual User Profile
            const userRef = doc(db, 'users', request.userId);
            await updateDoc(userRef, request.proposedData);

            // 2. Mark request as completed
            await updateDoc(doc(db, 'profile_edit_requests', requestId), {
                status: 'completed',
                approvedAt: serverTimestamp(),
                approvedBy: currentUser?.uid
            });

            // Log Action
            await logAdminAction({
                adminId: currentUser?.uid || 'Unknown',
                adminName: `${displayData.firstName} ${displayData.lastName}`,
                action: 'APPROVE_PROFILE_EDIT',
                targetId: request.userId,
                targetName: request.userName || 'Unknown User',
                details: `Approved changes: ${Object.keys(request.proposedData).join(', ')}`
            });

            // Send Notification
            await sendNotification({
                userId: request.userId,
                title: "Profile Updated",
                message: "Your profile changes have been approved and applied.",
                type: "success",
                link: "/dashboard"
            });

            showToast("Profile updated and approved successfully!", "success");
            fetchProfileRequests();
        } catch (error) {
            console.error("Error approving request:", error);
            showToast("Failed to apply profile changes.", "error");
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await deleteDoc(doc(db, 'profile_edit_requests', requestId));
            showToast("Request rejected.", "info");
            fetchProfileRequests();
        } catch (error) {
            showToast("Action failed.", "error");
        }
    };

    const fetchStats = async () => {
        try {
            const [usersCount, regsCount] = await Promise.all([
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(collection(db, 'registrations'))
            ]);
            setStats({
                totalUsers: usersCount.data().count,
                totalRegistrations: regsCount.data().count,
                activeEvents: competitionsData.length
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchSuperAdminData = async () => {
        setIsFetchingData(true);
        try {
            if (activeTab === 'Admins') {
                const q = query(collection(db, 'admins'), orderBy('createdAt', 'desc'), limit(50));
                const snapshot = await getDocs(q);
                setAdminsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else if (activeTab === 'Users') {
                const q = query(collection(db, 'users'), orderBy('registeredAt', 'desc'), limit(50));
                const snapshot = await getDocs(q);
                setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else if (activeTab === 'Search') {
                // Fetch limited recent records for search context
                const [adminSnap, userSnap] = await Promise.all([
                    getDocs(query(collection(db, 'admins'), orderBy('createdAt', 'desc'), limit(50))),
                    getDocs(query(collection(db, 'users'), orderBy('registeredAt', 'desc'), limit(50)))
                ]);
                setAdminsList(adminSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setUsersList(userSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } catch (error) {
            console.error("Error fetching admin/user list:", error);
            showToast("Failed to load data.", "error");
        } finally {
            setIsFetchingData(false);
        }
    };

    const handleDeleteRecord = async (id: string, type: 'admins' | 'users') => {
        if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;
        
        try {
            const docRef = doc(db, type, id);
            const snapshot = await getDocs(query(collection(db, type), where('__name__', '==', id)));
            const targetData = snapshot.docs[0]?.data();

            await deleteDoc(docRef);

            // Log Action
            await logAdminAction({
                adminId: currentUser?.uid || 'Unknown',
                adminName: `${displayData.firstName} ${displayData.lastName}`,
                action: type === 'admins' ? 'DELETE_ADMIN' : 'DELETE_USER',
                targetId: id,
                targetName: targetData ? `${targetData.firstName} ${targetData.lastName}` : 'Unknown Record',
                details: `Deleted ${type.slice(0, -1)} record.`
            });

            showToast(`${type.slice(0, -1)} deleted successfully.`, "success");
            fetchSuperAdminData();
        } catch (error) {
            showToast("Failed to delete record.", "error");
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

    const selectAll = (list: any[]) => {
        if (selectedIds.size === list.length && list.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(list.map(item => item.id)));
        }
    };

    const handleBulkDelete = async (type: 'admins' | 'users') => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you SURE you want to permanently delete ${selectedIds.size} ${type}? This action is irreversible.`)) return;

        setIsProcessingBulk(true);
        const batch = writeBatch(db);
        const idsArray = Array.from(selectedIds);
        const listToSearch = type === 'admins' ? adminsList : usersList;
        const selectedRecords = listToSearch.filter(r => selectedIds.has(r.id));

        try {
            for (const id of idsArray) {
                batch.delete(doc(db, type, id));
            }

            await batch.commit();

            // Log Actions
            for (const record of selectedRecords) {
                await logAdminAction({
                    adminId: currentUser?.uid || 'Unknown',
                    adminName: `${displayData.firstName} ${displayData.lastName}`,
                    action: type === 'admins' ? 'DELETE_ADMIN' : 'DELETE_USER',
                    targetId: record.id,
                    targetName: `${record.firstName} ${record.lastName}`,
                    details: `Bulk Deletion from ${type} database.`
                });
            }

            showToast(`Successfully deleted ${selectedIds.size} ${type}.`, "success");
            setSelectedIds(new Set());
            fetchSuperAdminData();
        } catch (error) {
            console.error("Bulk delete error:", error);
            showToast(`Failed to complete bulk deletion.`, "error");
        } finally {
            setIsProcessingBulk(false);
        }
    };

    const handleExportRecords = async (type: 'admins' | 'users', format: 'csv' | 'xlsx' | 'json') => {
        setIsExporting(true);
        setShowExportMenu({type: null});
        try {
            const q = query(collection(db, type), orderBy(type === 'admins' ? 'createdAt' : 'registeredAt', 'desc'));
            const snapshot = await getDocs(q);
            const allData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt ? new Date(doc.data().createdAt).toLocaleString() : '',
                registeredAt: doc.data().registeredAt ? new Date(doc.data().registeredAt).toLocaleString() : '',
                lastLogin: doc.data().lastLogin ? new Date(doc.data().lastLogin).toLocaleString() : ''
            }));

            const fileName = `Talentron_${type.charAt(0).toUpperCase() + type.slice(1)}_${new Date().toISOString().split('T')[0]}`;

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
                XLSX.utils.book_append_sheet(workbook, worksheet, type.charAt(0).toUpperCase() + type.slice(1));
                
                if (format === 'csv') {
                    XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
                } else {
                    XLSX.writeFile(workbook, `${fileName}.xlsx`);
                }
            }

            showToast(`Exported ${allData.length} ${type} records to ${format.toUpperCase()}`, "success");
            
            // Log Export Action
            await logAdminAction({
                adminId: currentUser?.uid || 'Unknown',
                adminName: `${displayData.firstName} ${displayData.lastName}`,
                action: 'EXPORT_RECORDS' as any,
                targetId: type,
                targetName: `${type.toUpperCase()} DATABASE`,
                details: `Format: ${format}, Count: ${allData.length}`
            });

        } catch (error) {
            console.error("Export error:", error);
            showToast(`Failed to export ${type}.`, "error");
        } finally {
            setIsExporting(false);
        }
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
        let val = e.target.value.toUpperCase();
        let cleanVal = val.replace(/[^A-Z0-9]/g, '');
        let formatted = '';

        if (cleanVal.length > 0) {
            // TLRN
            formatted += cleanVal.substring(0, 4).replace(/[0-9]/g, '');
            if (cleanVal.length > 4) {
                formatted += '-';
                // ADM
                formatted += cleanVal.substring(4, 7).replace(/[0-9]/g, '');
                if (cleanVal.length > 7) {
                    formatted += '-';
                    // 0000
                    formatted += cleanVal.substring(7, 11).replace(/[A-Z]/g, '');
                }
            }
        }
        setDeleteConfirmInput(formatted.substring(0, 15));
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteAccount();
            showToast("Admin account deleted permanently.", "success");
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            if (error.message === 'RE_AUTH_REQUIRED') {
                showToast("Please re-authenticate to delete account.", "info");
                try {
                    await reauthenticate();
                    showToast("Verified! Click delete again.", "success");
                } catch (reAuthErr) {
                    showToast("Verification failed.", "error");
                }
            } else {
                showToast("Failed to delete account.", "error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const renderAccessDenied = (permission: string) => (
        <div className="access-denied-container">
            <div className="denied-card">
                <div className="denied-icon">🚫</div>
                <h1>Access Denied</h1>
                <p>You do not have the <strong>{permission}</strong> permission required to view this section.</p>
                <p className="denied-hint">Contact a Super Admin if you believe this is an error.</p>
                <button 
                    className="denied-back-btn"
                    onClick={() => setActiveTab('Overview')}
                >
                    BACK TO OVERVIEW
                </button>
            </div>
        </div>
    );

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
                                <h3>Total Students</h3>
                                <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
                            </div>
                            <div className="overview-stat-card">
                                <h3>Active Events</h3>
                                <div className="stat-value">{stats.activeEvents.toLocaleString()}</div>
                            </div>
                            <div className="overview-stat-card">
                                <h3>Registrations</h3>
                                <div className="stat-value">{stats.totalRegistrations.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                );
            case 'Search':
                if (!isSuperAdmin) return null;
                return (
                    <div className="management-view-container">
                        <div className="view-header">
                            <h1>Global Search</h1>
                            <p>Search for any user or administrator across the entire system by name, email, or TLRN ID.</p>
                        </div>

                        <div className="search-controls" style={{ marginBottom: '3rem' }}>
                            <div className="search-box">
                                <span className="search-icon" style={{ fontSize: '1.5rem', opacity: 1 }}>^_^</span>
                                <input 
                                    type="text" 
                                    placeholder="   Enter TLRN ID, Name or Email..." 
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    className="search-input"
                                    style={{ 
                                        fontSize: '1.2rem', 
                                        padding: '1.5rem 1.5rem 1.5rem 4rem',
                                        backgroundColor: '#000',
                                        border: '4px solid #333'
                                    }}
                                />
                                {userSearchQuery && (
                                    <button className="clear-search" onClick={() => setUserSearchQuery('')}>&times;</button>
                                )}
                            </div>
                        </div>

                        <div className="record-list">
                            {userSearchQuery.length < 2 ? (
                                <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.3 }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔦</div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                        Enter at least 2 characters to search...
                                    </h2>
                                </div>
                            ) : (
                                <>
                                    {[...adminsList.map(a => ({...a, sourceType: 'Admin'})), ...usersList.map(u => ({...u, sourceType: 'User'}))]
                                        .filter(person => {
                                            const q = userSearchQuery.toLowerCase().trim();
                                            const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
                                            const email = (person.email || '').toLowerCase();
                                            const tId = (person.talentronId || person.adminId || '').toLowerCase();
                                            return fullName.includes(q) || email.includes(q) || tId.includes(q);
                                        })
                                        .map((person, idx) => (
                                            <div key={person.id + idx} className="record-card" style={{ borderLeft: `8px solid ${person.sourceType === 'Admin' ? '#ff0059' : '#00d4ff'}`, borderRadius: '3rem' }}>
                                                <div className="record-info">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <span style={{ 
                                                            fontSize: '0.7rem', 
                                                            background: person.sourceType === 'Admin' ? '#ff0059' : '#00d4ff',
                                                            color: '#fff',
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '2rem',
                                                            fontWeight: 950
                                                        }}>{person.sourceType.toUpperCase()}</span>
                                                        <h3 style={{ margin: 0 }}>{person.firstName} {person.lastName}</h3>
                                                    </div>
                                                    <span className="record-id">{person.talentronId || person.adminId}</span>
                                                    <p>{person.email} | {person.major || person.role || 'N/A'}</p>
                                                </div>
                                                <div className="record-actions">
                                                    <button className="edit-btn" onClick={() => setEditModal({ data: person, type: person.sourceType === 'Admin' ? 'admins' : 'users' })}>VIEW / EDIT</button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    {userSearchQuery.length >= 2 && adminsList.length === 0 && usersList.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                                            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>Data hasn't been synced from the database yet.</p>
                                            <button className="nav-cta-btn" style={{ width: 'auto', display: 'inline-block' }} onClick={fetchSuperAdminData}>
                                                SYNC DATABASE NOW
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'Admins':
                if (!isSuperAdmin) return renderAccessDenied('super_admin');
                return (
                    <div className="management-view-container">
                        <div className="view-header-row">
                            <div>
                                <h1>Admin Management</h1>
                                <p>Overview of all administrative personnel on the platform.</p>
                            </div>
                            <div className="view-actions-wrapper">
                                <button 
                                    className="export-menu-btn" 
                                    onClick={() => setShowExportMenu({type: showExportMenu.type === 'admins' ? null : 'admins'})}
                                    disabled={isExporting}
                                >
                                    {isExporting ? 'PREPARING...' : 'EXPORT ADMINS ▼'}
                                </button>
                                {showExportMenu.type === 'admins' && (
                                    <div className="export-dropdown" style={{ right: 0, top: 'calc(100% + 10px)' }}>
                                        <div className="export-option" onClick={() => handleExportRecords('admins', 'csv')}>DOWNLOAD CSV</div>
                                        <div className="export-option" onClick={() => handleExportRecords('admins', 'xlsx')}>DOWNLOAD EXCEL</div>
                                        <div className="export-option" onClick={() => handleExportRecords('admins', 'json')}>DOWNLOAD JSON</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isFetchingData ? (
                            <div className="record-list">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="record-card skeleton-pulse" style={{ height: '80px', opacity: 0.5 }}></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {adminsList.length > 0 && (
                                    <div className="selection-actions-bar">
                                         <div className="selection-bar-info">
                                             <label className="check-container" style={{ margin: 0 }}>
                                                 <input 
                                                     type="checkbox" 
                                                     checked={selectedIds.size === adminsList.length && adminsList.length > 0} 
                                                     onChange={() => selectAll(adminsList)} 
                                                 />
                                                 <span className="checkmark"></span>
                                             </label>
                                             <span className="selection-count-text">
                                                 {selectedIds.size === 0 ? 'SELECT ALL ADMINS' : `${selectedIds.size} ADMINS SELECTED`}
                                             </span>
                                         </div>

                                        {selectedIds.size > 0 && (
                                            <button 
                                                className="bulk-btn delete" 
                                                onClick={() => handleBulkDelete('admins')}
                                                disabled={isProcessingBulk}
                                            >
                                                {isProcessingBulk ? 'DELETING...' : 'DELETE SELECTED'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="record-list">
                                    {adminsList.map(admin => (
                                        <div key={admin.id} className={`record-card ${selectedIds.has(admin.id) ? 'selected' : ''}`}>
                                             <div className="record-main-section">
                                                 <label className="check-container" style={{ margin: 0 }}>
                                                     <input 
                                                         type="checkbox" 
                                                         checked={selectedIds.has(admin.id)} 
                                                         onChange={() => toggleSelection(admin.id)} 
                                                     />
                                                     <span className="checkmark"></span>
                                                 </label>
                                                 <div className="record-info">
                                                     <h3>{admin.firstName} {admin.lastName}</h3>
                                                     <span className="record-id">{admin.adminId}</span>
                                                     <p>{admin.email} | {admin.role}</p>
                                                 </div>
                                             </div>
                                            <div className="record-actions">
                                                <button className="edit-btn" onClick={() => setEditModal({ data: admin, type: 'admins' })}>Edit</button>
                                                <button className="delete-btn" onClick={() => handleDeleteRecord(admin.id, 'admins')}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'Users':
                if (!isSuperAdmin) return renderAccessDenied('super_admin');
                return (
                    <div className="management-view-container">
                        <div className="view-header-row">
                            <div>
                                <h1>User Management</h1>
                                <p>Global student database and profile management.</p>
                            </div>
                            <div className="view-actions-wrapper">
                                <button 
                                    className="export-menu-btn" 
                                    onClick={() => setShowExportMenu({type: showExportMenu.type === 'users' ? null : 'users'})}
                                    disabled={isExporting}
                                >
                                    {isExporting ? 'PREPARING...' : 'EXPORT USERS ▼'}
                                </button>
                                {showExportMenu.type === 'users' && (
                                    <div className="export-dropdown" style={{ right: 0, top: 'calc(100% + 10px)' }}>
                                        <div className="export-option" onClick={() => handleExportRecords('users', 'csv')}>DOWNLOAD CSV</div>
                                        <div className="export-option" onClick={() => handleExportRecords('users', 'xlsx')}>DOWNLOAD EXCEL</div>
                                        <div className="export-option" onClick={() => handleExportRecords('users', 'json')}>DOWNLOAD JSON</div>
                                    </div>
                                )}
                            </div>
                        </div>


                        {isFetchingData ? (
                            <div className="record-list">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="record-card skeleton-pulse" style={{ height: '80px', opacity: 0.5 }}></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {usersList.length > 0 && (
                                    <div className="selection-actions-bar">
                                         <div className="selection-bar-info">
                                             <label className="check-container" style={{ margin: 0 }}>
                                                 <input 
                                                     type="checkbox" 
                                                     checked={selectedIds.size === usersList.length && usersList.length > 0} 
                                                     onChange={() => selectAll(usersList)} 
                                                 />
                                                 <span className="checkmark"></span>
                                             </label>
                                             <span className="selection-count-text">
                                                 {selectedIds.size === 0 ? 'SELECT ALL USERS' : `${selectedIds.size} USERS SELECTED`}
                                             </span>
                                         </div>

                                        {selectedIds.size > 0 && (
                                            <button 
                                                className="bulk-btn delete" 
                                                onClick={() => handleBulkDelete('users')}
                                                disabled={isProcessingBulk}
                                            >
                                                {isProcessingBulk ? 'DELETING...' : 'DELETE SELECTED'}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="record-list">
                                    <div className="search-controls" style={{ marginBottom: '2rem' }}>
                                        <div className="search-box">
                                            <span className="search-icon">^_^</span>
                                            <input 
                                                type="text" 
                                                placeholder="Search in current page..." 
                                                value={userSearchQuery}
                                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                                className="search-input"
                                            />
                                            {userSearchQuery && (
                                                <button className="clear-search" onClick={() => setUserSearchQuery('')}>&times;</button>
                                            )}
                                        </div>
                                    </div>
                                    {usersList
                                        .filter(user => {
                                            const query = userSearchQuery.toLowerCase().trim();
                                            if (!query) return true;
                                            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                                            const email = (user.email || '').toLowerCase();
                                            const tId = (user.talentronId || '').toLowerCase();
                                            return fullName.includes(query) || email.includes(query) || tId.includes(query);
                                        })
                                        .map(user => (
                                        <div key={user.id} className={`record-card ${selectedIds.has(user.id) ? 'selected' : ''}`}>
                                             <div className="record-main-section">
                                                 <label className="check-container" style={{ margin: 0 }}>
                                                     <input 
                                                         type="checkbox" 
                                                         checked={selectedIds.has(user.id)} 
                                                         onChange={() => toggleSelection(user.id)} 
                                                     />
                                                     <span className="checkmark"></span>
                                                 </label>
                                                 <div className="record-info">
                                                     <h3>{user.firstName} {user.lastName}</h3>
                                                     <span className="record-id">{user.talentronId}</span>
                                                     <p>{user.email} | {user.major} | {user.college}</p>
                                                 </div>
                                             </div>
                                            <div className="record-actions">
                                                <button className="edit-btn" onClick={() => setEditModal({ data: user, type: 'users' })}>View</button>
                                                <button className="delete-btn" onClick={() => handleDeleteRecord(user.id, 'users')}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
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
            case 'Profile Edits':
                if (!canManageProfileEdits) return renderAccessDenied('manage_profile_edits');
                return (
                    <div className="management-view-container">
                        <div className="view-header">
                            <h1>Profile Edit Requests</h1>
                            <p>Approve or reject student requests for identity and record changes.</p>
                        </div>

                        {isFetchingData ? (
                            <div className="record-list">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="record-card skeleton-pulse" style={{ height: '80px', opacity: 0.5 }}></div>
                                ))}
                            </div>
                        ) : profileRequests.length === 0 ? (
                            <div className="empty-state-container">
                                <div className="empty-state-icon">✅</div>
                                <h2 className="empty-state-title">No Pending Requests</h2>
                            </div>
                        ) : (
                            <div className="record-list">
                                {profileRequests.map(req => (
                                    <div key={req.id} className="record-card" style={{ borderLeft: '8px solid #f0ff00' }}>
                                        <div className="record-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span className="status-badge">REQUEST</span>
                                                <h3 style={{ margin: 0 }}>{req.userName}</h3>
                                            </div>
                                            <span className="record-id">{req.talentronId}</span>
                                            <p>Reason: {req.reason || 'Not specified'}</p>
                                        </div>
                                        <div className="record-actions">
                                            <button className="edit-btn" style={{ background: '#f0ff00' }} onClick={() => handleApproveRequest(req.id)}>APPROVE</button>
                                            <button className="delete-btn" onClick={() => handleRejectRequest(req.id)}>REJECT</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'System Logs':
                if (!isSuperAdmin) return renderAccessDenied('super_admin');
                return (
                    <div className="management-view-container">
                        <div className="view-header">
                            <h1>System Audit Logs</h1>
                            <p>Activity trail for all administrative actions across the platform.</p>
                        </div>

                        {isFetchingData ? (
                            <div className="record-list">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="record-card skeleton-pulse" style={{ height: '70px', opacity: 0.5 }}></div>
                                ))}
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="loading-state">No activity logs found.</div>
                        ) : (
                            <div className="record-list">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="record-card audit-log-entry">
                                        <div className="record-info">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span className={`audit-badge ${log.action.toLowerCase().replace('_', '-')}`}>
                                                    {log.action.replace('_', ' ')}
                                                </span>
                                                <h3 style={{ fontSize: '1.1rem' }}>{log.adminName}</h3>
                                            </div>
                                            <p>
                                                <strong>Target:</strong> {log.targetName} | <strong>ID:</strong> {log.targetId}
                                            </p>
                                            {log.details && <p className="log-details">{log.details}</p>}
                                        </div>
                                        <div className="log-timestamp">
                                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'Registrations':
                if (!canManageRegistrations) return renderAccessDenied('manage_registrations');
                return (
                    <div className="registrations-view-container">
                        <div className="view-header">
                            <h1>Registrations</h1>
                            <p>Manage and oversee all event registrations and participant data.</p>
                        </div>

                        <div className="module-under-construction">
                            <div className="empty-state-icon">🏗️</div>
                            <h2 className="empty-state-title">Registration Module Coming Soon</h2>
                            <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '500px', margin: '1rem auto' }}>
                                We are currently building the registration management interface. You can also access this at 
                                <a href="#/manage-registration" style={{ color: '#ffc800', marginLeft: '5px', textDecoration: 'underline' }}>
                                    /manage-registration
                                </a>
                            </p>
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
                                            <input type="text" value={displayData.firstName} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input type="text" value={displayData.lastName} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" value={displayData.email} readOnly />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="text" defaultValue={displayData.phone} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Date of Birth</label>
                                            <input type="text" defaultValue={displayData.dob} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Sex</label>
                                            <input type="text" defaultValue={displayData.sex} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Department / Major</label>
                                            <input type="text" defaultValue={displayData.major} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Designation / Year</label>
                                            <input type="text" defaultValue={displayData.yearOfStudy} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Division</label>
                                            <input type="text" defaultValue={displayData.division} readOnly />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>ZPRN Number</label>
                                            <input type="text" defaultValue={displayData.zprn} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Roll / Staff ID</label>
                                            <input type="text" defaultValue={displayData.rollNo} readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-section-card">
                                <h2>Access & Permissions</h2>
                                <div className="permissions-badge-grid">
                                    {displayData.permissions.map((perm: string) => (
                                        <span key={perm} className="permission-badge">{perm.toUpperCase()}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="settings-section-card danger-zone">
                                <h2>Danger Zone</h2>
                                <p>Permanently remove your administrative access. This action cannot be undone.</p>
                                <button className="delete-account-btn" onClick={() => setIsDeleteModalOpen(true)}>DELETE ADMIN ACCOUNT</button>
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
                            {displayData.photoURL ? (
                                <img src={displayData.photoURL} alt="Profile" className="user-avatar-img" />
                            ) : (
                                <span>{displayData.firstName[0]}{displayData.lastName[0]}</span>
                            )}
                        </div>
                        <h2 className="user-name">{displayData.firstName} {displayData.lastName}</h2>
                        <p className="user-email">{displayData.email}</p>
                        <p className="user-id">{displayData.talentronId}</p>
                        
                        <div className="nav-stack">
                            {tabs.map((tab) => (
                                <button 
                                    key={tab}
                                    className={`nav-cta-btn ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => {
                                        if (tab === 'Registrations') {
                                            navigate('/manage-registration');
                                        } else {
                                            setActiveTab(tab);
                                        }
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                            <button 
                                className="nav-cta-btn logout-btn" 
                                onClick={async () => {
                                    try {
                                        await logout();
                                        showToast("Admin logged out.", "success");
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
                                <div className="confirm-id-display">{displayData.talentronId}</div>
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
                                className={`modal-action-btn delete ${deleteConfirmInput === displayData.talentronId ? 'active' : ''}`}
                                disabled={deleteConfirmInput !== displayData.talentronId}
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
                                <button 
                                    className="modal-action-btn delete active" 
                                    disabled={isDeleting}
                                    onClick={handleDeleteAccount}
                                >
                                    {isDeleting ? 'DELETING...' : 'CONFIRM DELETE'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}



            {/* Edit Record Modal Overlay */}
            {editModal && (
                <div className="fullscreen-overlay create-modal-overlay">
                    <div className="create-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setEditModal(null)}>&times;</button>
                        <div className="create-modal-header">
                            <h2>Edit {editModal.type === 'admins' ? 'Admin' : 'User'} Details</h2>
                            <p>Modify existing record information safely.</p>
                        </div>
                        
                        <div className="modal-form-scroll">
                            {editModal.type === 'admins' ? (
                                <AdminSignupForm 
                                    initialData={editModal.data}
                                    isAdminMode={true} 
                                    onSuccess={() => { setEditModal(null); fetchSuperAdminData(); }} 
                                    onCancel={() => setEditModal(null)} 
                                />
                            ) : (
                                <UserSignupForm 
                                    initialData={editModal.data}
                                    isAdminMode={true} 
                                    onSuccess={() => { setEditModal(null); fetchSuperAdminData(); }} 
                                    onCancel={() => setEditModal(null)} 
                                />
                            )}
                        </div>
                    </div>
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
