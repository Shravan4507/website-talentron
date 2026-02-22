import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireSignup?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requireAdmin = false,
    requireSignup = true 
}) => {
    const { currentUser, userProfile, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // Or a loading spinner

    if (!currentUser) {
        // Redirect to login but save the current location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if admin access is required
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/user-dashboard" replace />;
    }

    // Check if user is signed up (has a firestore profile)
    // If they aren't signed up and aren't on the signup page, send them there
    if (requireSignup && !isAdmin && !userProfile && location.pathname !== '/user-signup') {
        return <Navigate to="/user-signup" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
