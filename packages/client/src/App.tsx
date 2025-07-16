import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import OverviewNew from './components/OverviewNew';
import DayDetail from './components/DayDetail';
import MarchersPage from './components/MarchersPage';
import OrganizationsPage from './components/OrganizationsPage';
import VehiclesPage from './components/VehiclesPage';
import MarcherSchedule from './components/MarcherSchedule';
import OrganizationSchedule from './components/OrganizationSchedule';
import DayManagement from './components/DayManagement';
import DataManagement from './components/DataManagement';
import VehicleScheduleByVehicle from './components/VehicleScheduleByVehicle';
import LegacyContextWrapper from './components/LegacyContextWrapper';

const App: React.FC = () => {
  // Feature flag to switch between old and new implementations
  const USE_NEW_OVERVIEW = process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_NEW_OVERVIEW === 'true';

  return (
    <AuthProvider>    
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<OverviewNew />} />
            <Route path="/overview-new" element={<OverviewNew />} />
            <Route path="/day/:dayId" element={<DayDetail />} />
            <Route path="/login" element={<Login />} />
            {/* Protected Routes - Require Editor Access */}
            <Route 
              path="/marchers" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <MarchersPage />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/organizations" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <OrganizationsPage />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicles" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <VehiclesPage />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/vehicle-schedule" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <VehicleScheduleByVehicle />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marcher-schedule" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <MarcherSchedule />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/org-schedule" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <OrganizationSchedule />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/day-management" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <DayManagement />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/data-management" 
              element={
                <ProtectedRoute requireEditor={true}>
                  <LegacyContextWrapper>
                    <DataManagement />
                  </LegacyContextWrapper>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App; 