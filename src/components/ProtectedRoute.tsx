import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireEditor?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireEditor = false 
}) => {
  const { isAuthenticated, isLoading, isAdmin, isEditor } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need administrator privileges to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check editor requirement
  if (requireEditor && !isEditor()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need editor privileges to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute; 