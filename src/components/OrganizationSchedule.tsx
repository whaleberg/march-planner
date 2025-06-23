import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { Calendar, Building2, Check, X } from 'lucide-react';
import { OrganizationViewMode } from '../types';
import OrganizationScheduleByDay from './OrganizationScheduleByDay';

const OrganizationSchedule: React.FC = () => {
  const { marchData, updatePartnerOrganization, getDayNumber } = useMarchData();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<OrganizationViewMode>('by-day');

  // Handle URL parameter for pre-selecting an organization
  useEffect(() => {
    const orgId = searchParams.get('org');
    if (orgId && marchData.partnerOrganizations.find(o => o.id === orgId)) {
      setSelectedOrg(orgId);
    }
  }, [searchParams, marchData.partnerOrganizations]);

  const handleDayToggle = (orgId: string, dayId: string) => {
    const org = marchData.partnerOrganizations.find(o => o.id === orgId);
    if (!org) return;

    const updatedOrg = { ...org };
    const currentDays = updatedOrg.partnerDays || [];
    
    // Remove any duplicates first
    const uniqueDays = [...new Set(currentDays)];
    const dayIndex = uniqueDays.indexOf(dayId);
    
    if (dayIndex === -1) {
      // Add day to organization's schedule
      updatedOrg.partnerDays = [...uniqueDays, dayId];
    } else {
      // Remove day from organization's schedule
      updatedOrg.partnerDays = uniqueDays.filter(id => id !== dayId);
    }

    updatePartnerOrganization(orgId, updatedOrg);
  };

  const isOrgOnDay = (orgId: string, dayId: string) => {
    const org = marchData.partnerOrganizations.find(o => o.id === orgId);
    return org?.partnerDays?.includes(dayId) || false;
  };

  // If view mode is by-organization, render the OrganizationScheduleByDay component
  if (viewMode === 'by-organization') {
    return <OrganizationScheduleByDay />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-8 w-8 mr-3" />
          Partner Organization Schedule by Day
        </h1>
        <p className="text-gray-600 mt-2">Select which days each partner organization will participate in the march.</p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-2 inline-flex">
          <button
            onClick={() => setViewMode('by-day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'by-day'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            View by Day
          </button>
          <button
            onClick={() => setViewMode('by-organization')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'by-organization'
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 className="h-4 w-4 inline mr-2" />
            View by Organization
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organizations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Partner Organizations
            </h2>
            <div className="space-y-2">
              {marchData.partnerOrganizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => setSelectedOrg(org.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedOrg === org.id
                      ? 'bg-orange-100 border-orange-500 border-2'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{org.name}</div>
                  <div className="text-sm text-gray-600 truncate">{org.description}</div>
                  {org.partnerDays && org.partnerDays.length > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      {org.partnerDays.length} day(s) scheduled
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">March Schedule</h2>
            {selectedOrg ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">
                    Scheduling for: {marchData.partnerOrganizations.find(o => o.id === selectedOrg)?.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marchData.days.map((day) => (
                    <div
                      key={day.id}
                      className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        isOrgOnDay(selectedOrg, day.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleDayToggle(selectedOrg, day.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Day {getDayNumber(day.id)}</span>
                        {isOrgOnDay(selectedOrg, day.id) ? (
                          <Check className="h-5 w-5 text-orange-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {day.route.startPoint} → {day.route.endPoint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a partner organization to view and edit their schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSchedule; 