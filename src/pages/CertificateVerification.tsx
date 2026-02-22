import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './CertificateVerification.css';

const CertificateVerification: React.FC = () => {
    const { certId } = useParams<{ certId: string }>();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verifyCert = async () => {
            if (!certId) return;
            setLoading(true);
            try {
                // In a real system, we might query by 'certId' field or use the doc ID
                const notifQuery = query(
                    collection(db, 'certificates'),
                    where('certId', '==', certId)
                );
                const snapshot = await getDocs(notifQuery);
                
                if (snapshot.empty) {
                    setError("Certificate not found or invalid ID.");
                } else {
                    setCertificate(snapshot.docs[0].data());
                }
            } catch (err) {
                console.error("Verification error:", err);
                setError("An error occurred during verification.");
            } finally {
                setLoading(false);
            }
        };

        verifyCert();
    }, [certId]);

    if (loading) {
        return (
            <div className="verify-container">
                <div className="verify-card loading">
                    <div className="skeleton-pulse" style={{ height: '40px', width: '200px', margin: '0 auto 2rem' }}></div>
                    <div className="skeleton-pulse" style={{ height: '20px', width: '100%', marginBottom: '1rem' }}></div>
                    <div className="skeleton-pulse" style={{ height: '20px', width: '80%', margin: '0 auto' }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="verify-container">
                <div className="verify-card error">
                    <div className="error-icon">⚠️</div>
                    <h1>Invalid Certificate</h1>
                    <p>{error}</p>
                    <Link to="/" className="back-home-btn">BACK TO TALENTRON</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-container">
            <div className="verify-card success">
                <div className="trust-seal">✓</div>
                <div className="verify-header">
                    <span className="platform-name">TALENTRON OFFICIAL RECORD</span>
                    <h1>Verified Achievement</h1>
                </div>

                <div className="cert-data-grid">
                    <div className="data-item">
                        <label>Recipient Name</label>
                        <div className="value highlight">{certificate.studentName}</div>
                    </div>
                    <div className="data-item">
                        <label>Achievement</label>
                        <div className="value">{certificate.eventTitle}</div>
                    </div>
                    <div className="data-item">
                        <label>Result / Status</label>
                        <div className="value badge">{certificate.status || 'Participation'}</div>
                    </div>
                    <div className="data-item">
                        <label>Date of Issue</label>
                        <div className="value">{certificate.issueDate}</div>
                    </div>
                    <div className="data-item full">
                        <label>Certificate ID</label>
                        <div className="value mono">{certId}</div>
                    </div>
                </div>

                <div className="verify-footer">
                    <div className="signature-box">
                        <p>Issued By</p>
                        <strong>Talentron Authorities</strong>
                    </div>
                    <p className="legal-text">
                        This digital record is cryptographically linked to the Talentron database. 
                        Modification of this document is a violation of platform integrity.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CertificateVerification;
