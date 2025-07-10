import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MarchProvider } from './context/MarchContext';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Overview from './components/Overview';
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

const App: React.FC = () => {
  // Feature flag to switch between old and new implementations
  const USE_NEW_OVERVIEW = process.env.NODE_ENV === 'development' || process.env.REACT_APP_USE_NEW_OVERVIEW === 'true';

  return (
    <AuthProvider>    
      <MarchProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={USE_NEW_OVERVIEW ? <OverviewNew /> : <Overview />} />
              <Route path="/overview-new" element={<OverviewNew />} />
              <Route path="/overview-old" element={<Overview />} />
              <Route path="/day/:dayId" element={<DayDetail />} />
              <Route path="/login" element={<Login />} />
              {/* Protected Routes - Require Editor Access */}
              <Route 
                path="/marchers" 
                element={
                  <ProtectedRoute requireEditor={true}>
                    <MarchersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/organizations" 
                element={
                  <ProtectedRoute requireEditor={true}>
                    <OrganizationsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vehicles" 
                element={
                  <ProtectedRoute requireEditor={true}>
                    <VehiclesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/vehicle-schedule" 
                element={
                  <ProtectedRoute requireEditor={true}>
                    <VehicleScheduleByVehicle />
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
                    <OrganizationSchedule />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/day-management" 
                element={
                  <ProtectedRoute requireEditor={true}>
                    <DayManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/data-management" 
                element={
                  <ProtectedRoute requireEditor={true}>
                    <DataManagement />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
        </MarchProvider>
      </AuthProvider>
  );
};

export default App; 