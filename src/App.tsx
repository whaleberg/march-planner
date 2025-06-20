import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MarchProvider } from './context/MarchContext';
import Navigation from './components/Navigation';
import Overview from './components/Overview';
import DayDetail from './components/DayDetail';
import MarchersPage from './components/MarchersPage';
import OrganizationsPage from './components/OrganizationsPage';
import MarcherSchedule from './components/MarcherSchedule';
import OrganizationSchedule from './components/OrganizationSchedule';
import DayManagement from './components/DayManagement';
import DataManagement from './components/DataManagement';

const App: React.FC = () => {
  return (
    <MarchProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/day/:dayId" element={<DayDetail />} />
              <Route path="/marchers" element={<MarchersPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/marcher-schedule" element={<MarcherSchedule />} />
              <Route path="/org-schedule" element={<OrganizationSchedule />} />
              <Route path="/day-management" element={<DayManagement />} />
              <Route path="/data-management" element={<DataManagement />} />
            </Routes>
          </main>
        </div>
      </Router>
    </MarchProvider>
  );
};

export default App; 