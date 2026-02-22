import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RegistrationForm from '../../components/form/RegistrationForm';
import OutlinedTitle from '../../components/heading/OutlinedTitle';
import './RegisterEvent.css';

const RegisterEvent: React.FC = () => {
    const { genre } = useParams<{ genre: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Try to get competition name from query params (?comp=Singing%20Competition)
    const queryParams = new URLSearchParams(location.search);
    const compName = queryParams.get('comp') || 'Event';
    const categoryName = genre ? decodeURIComponent(genre) : 'Competitions';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSuccess = () => {
        // You can add a toast notification here
        setTimeout(() => {
            navigate(`/competitions/${genre}`);
        }, 2000);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="register-event-page">
            <div className="register-header">
                <div className="subtitle-wrapper">
                    <OutlinedTitle 
                        text={categoryName.toUpperCase()} 
                        className="small"
                        fillColor="linear-gradient(180deg, #ff00ea 0%, #7000ff 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
                <div className="main-title-wrapper">
                    <OutlinedTitle 
                        text="REGISTRATION" 
                        fillColor="linear-gradient(180deg, #f0ff00 0%, #ff5e00 100%)" 
                        outlineColor="#000000" 
                        shadowColor="#000000"
                        hasGrain={true}
                    />
                </div>
            </div>

            <RegistrationForm 
                eventName={compName} 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />

            <div className="register-background-text">
                TALENTRON '26
            </div>
        </div>
    );
};

export default RegisterEvent;
