import React, { useState } from 'react';
import { Users, Calendar, Mail, Stethoscope, Shield, X, Save, Clock } from 'lucide-react';
import { 
  useMarches, 
  useMarchDays, 
  useMarchers, 
  useMarcherDayAssignments,
  useCreateMarcherDayAssignment,
  useDeleteMarcherDayAssignment
} from '../hooks/useMarchData';

const MarcherScheduleByDay: React.FC = () => {
  const [editingMarcherId, setEditingMarcherId] = useState<string | null>(null);

  // Get march data
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // Get days and marchers
  const { data: daysData } = useMarchDays(marchId || '');
  const { data: marchersData } = useMarchers(marchId);

  // Get all marcher assignments for this march
  const { data: assignmentsData } = useMarcherDayAssignments(undefined, undefined);

  // Mutations
  const createAssignmentMutation = useCreateMarcherDayAssignment();
  const deleteAssignmentMutation = useDeleteMarcherDayAssignment();

  const days = daysData?.data || [];
  const marchers = marchersData?.data || [];
  const assignments = assignmentsData?.data || [];

  const handleDayToggle = async (marcherId: string, dayId: string) => {
    if (!marchId) return;

    // Check if assignment already exists
    const existingAssignment = assignments.find(
      a => a.marcherId === marcherId && a.dayId === dayId
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
          marcherId,
          dayId,
          marchId,
          role: 'participant'
        });
      }
    } catch (error) {
      console.error('Failed to toggle marcher assignment:', error);
    }
  };

  const getMarcherDayCount = (marcherId: string) => {
    return assignments.filter(a => a.marcherId === marcherId).length;
  };

  const isMarcherOnDay = (marcherId: string, dayId: string) => {
    return assignments.some(a => a.marcherId === marcherId && a.dayId === dayId);
  };

  const getMarcherDays = (marcherId: string) => {
    return assignments
      .filter(a => a.marcherId === marcherId)
      .map(a => a.dayId);
  };

  const handleSave = () => {
    setEditingMarcherId(null);
  };

  const handleCancel = () => {
    setEditingMarcherId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Marcher Schedule by Marcher</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Assign marchers to specific days of the march. Select which days each marcher will participate.
        </p>
      </div>

      {/* Marchers List */}
      <div className="space-y-6">
        {marchers.map((marcher) => {
          const isEditing = editingMarcherId === marcher.id;
          const marcherDays = getMarcherDays(marcher.id);

          return (
            <div key={marcher.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{marcher.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {marcher.email}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {getMarcherDayCount(marcher.id)} day{getMarcherDayCount(marcher.id) !== 1 ? 's' : ''} assigned
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
                      onClick={() => setEditingMarcherId(marcher.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Training Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {marcher.medic && (
                  <div className="flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    Medic
                  </div>
                )}
                {marcher.peacekeeper && (
                  <div className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <Shield className="h-3 w-3 mr-1" />
                    Peacekeeper
                  </div>
                )}
              </div>

              {/* Days Assignment */}
              {isEditing ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Assign Days</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {days.map((day, index) => {
                      const isAssigned = isMarcherOnDay(marcher.id, day.id);
                      return (
                        <label key={day.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleDayToggle(marcher.id, day.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                  {marcherDays.length > 0 ? (
                    <div className="space-y-1">
                      {marcherDays.map((dayId) => {
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

      {marchers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No marchers yet</h3>
          <p className="text-gray-600 mb-4">Add marchers first to start scheduling.</p>
        </div>
      )}
    </div>
  );
};

export default MarcherScheduleByDay; 