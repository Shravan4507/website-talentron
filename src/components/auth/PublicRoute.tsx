import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicRouteProps {
    children: React.ReactNode;
    onlyForUnregistered?: boolean;
}

/**
 * PublicRoute prevents authenticated and registered users from accessing 
 * pages like /login or /user-signup.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children, onlyForUnregistered = false }) => {
    const { currentUser, userProfile, isAdmin, loading } = useAuth();

    if (loading) return null;

    if (currentUser) {
        // If they are an admin, always send to admin dashboard
        if (isAdmin) {
            return <Navigate to="/admin-dashboard" replace />;
        }

        // If they have a profile (registered), they shouldn't be here
        if (userProfile) {
            return <Navigate to="/user-dashboard" replace />;
        }

        // If onlyForUnregistered is true, and they are NOT registered (which they aren't if they reached here),
        // we allow them to stay (e.g., on /user-signup)
        // BUT if they are on /login and they are logged in but not registered, we should send them to /user-signup
        if (!onlyForUnregistered) {
            return <Navigate to="/user-signup" replace />;
        }
    }

    return <>{children}</>;
};

export default PublicRoute;
