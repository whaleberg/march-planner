import React, { useState } from 'react';
import { Building2, Calendar, Mail, X, Save, Clock } from 'lucide-react';
import {
  useMarches,
  useMarchDays,
  usePartnerOrganizations,
  useOrganizationDayAssignments,
  useCreateOrganizationDayAssignment,
  useDeleteOrganizationDayAssignment
} from '../hooks/useMarchData';

const OrganizationScheduleByDay: React.FC = () => {
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  // Get march data
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // Get days and organizations
  const { data: daysData } = useMarchDays(marchId || '');
  const { data: organizationsData } = usePartnerOrganizations(marchId);

  // Get all organization assignments for this march
  const { data: assignmentsData } = useOrganizationDayAssignments(undefined, undefined);

  // Mutations
  const createAssignmentMutation = useCreateOrganizationDayAssignment();
  const deleteAssignmentMutation = useDeleteOrganizationDayAssignment();

  const days = daysData?.data || [];
  const organizations = organizationsData?.data || [];
  const assignments = assignmentsData?.data || [];

  const handleDayToggle = async (orgId: string, dayId: string) => {
    if (!marchId) return;

    // Check if assignment already exists
    const existingAssignment = assignments.find(
      a => a.organizationId === orgId && a.dayId === dayId
    );

    try {
      if (existingAssignment) {
        // Remove assignment
        await deleteAssignmentMutation.mutateAsync({
          id: existingAssignment.id,
          softDelete: true
        });
      } else {
        // Create new assignment
        await createAssignmentMutation.mutateAsync({
          organizationId: orgId,
          dayId,
          marchId,
          role: 'supporter'
        });
      }
    } catch (error) {
      console.error('Failed to toggle organization assignment:', error);
    }
  };

  const getOrganizationDayCount = (orgId: string) => {
    return assignments.filter(a => a.organizationId === orgId).length;
  };

  const isOrganizationOnDay = (orgId: string, dayId: string) => {
    return assignments.some(a => a.organizationId === orgId && a.dayId === dayId);
  };

  const getOrganizationDays = (orgId: string) => {
    return assignments
      .filter(a => a.organizationId === orgId)
      .map(a => a.dayId);
  };

  const handleSave = () => {
    setEditingOrgId(null);
  };

  const handleCancel = () => {
    setEditingOrgId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-full">
            <Building2 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Organization Schedule by Organization</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Assign partner organizations to specific days of the march. Select which days each organization will participate.
        </p>
      </div>

      {/* Organizations List */}
      <div className="space-y-6">
        {organizations.map((org) => {
          const isEditing = editingOrgId === org.id;
          const orgDays = getOrganizationDays(org.id);

          return (
            <div key={org.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 text-orange-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{org.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {org.contactEmail || 'No email'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {getOrganizationDayCount(org.id)} day{getOrganizationDayCount(org.id) !== 1 ? 's' : ''} assigned
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingOrgId(org.id)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{org.description}</p>

              {/* Days Assignment */}
              {isEditing ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Assign Days</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {days.map((day, index) => {
                      const isAssigned = isOrganizationOnDay(org.id, day.id);
                      return (
                        <label key={day.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleDayToggle(org.id, day.id)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Day {index + 1}: {day.route.startPoint} → {day.route.endPoint}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {orgDays.length > 0 ? (
                    <div className="space-y-1">
                      {orgDays.map((dayId) => {
                        const day = days.find(d => d.id === dayId);
                        const dayNumber = days.findIndex(d => d.id === dayId) + 1;
                        return day ? (
                          <div key={dayId} className="flex items-center">
                            <Calendar className="h-3 w-3 mr-2" />
                            <span>Day {dayNumber}: {day.route.startPoint} → {day.route.endPoint}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No days assigned</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations yet</h3>
          <p className="text-gray-600 mb-4">Add partner organizations first to start scheduling.</p>
        </div>
      )}
    </div>
  );
};

export default OrganizationScheduleByDay; 