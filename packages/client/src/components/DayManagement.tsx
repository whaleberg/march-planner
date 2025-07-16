import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarchDay } from '@march-organizer/shared';
import { Calendar, MapPin, Plus, Edit, Save, X, Trash2, Users, Building2, ArrowRight, Eye, Stethoscope, Shield, User, Crown } from 'lucide-react';
import { getRoutePointName } from '../utils/routeUtils';
import { 
  useMarches, 
  useMarchDays, 
  useCreateMarchDay, 
  useUpdateMarchDay, 
  useDeleteMarchDay,
  useUpdateMarch,
  useMarchers,
  usePartnerOrganizations
} from '../hooks/useMarchData';

const DayManagement: React.FC = () => {
  // Get march data to find the marchId
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;
  const march = marchesData?.data?.[0];

  // tRPC hooks for days and related data
  const { data: daysData, isLoading: daysLoading } = useMarchDays(marchId || '');
  const { data: marchersData } = useMarchers(marchId);
  const { data: organizationsData } = usePartnerOrganizations(marchId);
  const createMarchDayMutation = useCreateMarchDay();
  const updateMarchDayMutation = useUpdateMarchDay();
  const deleteMarchDayMutation = useDeleteMarchDay();
  const updateMarchMutation = useUpdateMarch();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [newDay, setNewDay] = useState<Partial<MarchDay>>({});
  const [editedDay, setEditedDay] = useState<MarchDay | null>(null);

  const days = daysData?.data || [];
  const marchers = marchersData?.data || [];
  const organizations = organizationsData?.data || [];

  const handleAddDay = async () => {
    if (!newDay.route?.startPoint || !newDay.route?.endPoint || !marchId) {
      alert('Please fill in start and end points');
      return;
    }

    try {
      const dayData = {
        marchId,
        date: '', // Will be set automatically based on position
        route: {
          startPoint: newDay.route.startPoint,
          endPoint: newDay.route.endPoint,
          routePoints: []
        },
        breakfast: {
          location: 'TBD',
          time: '7:00 AM',
          description: 'Breakfast provided'
        },
        lunch: {
          location: 'TBD',
          time: '12:00 PM',
          description: 'Lunch provided'
        },
        dinner: {
          location: 'TBD',
          time: '6:00 PM',
          description: 'Dinner provided'
        },
        specialEvents: []
      };

      await createMarchDayMutation.mutateAsync(dayData);
      setIsAdding(false);
      setNewDay({});
      setInsertPosition(null);
    } catch (error) {
      console.error('Failed to create day:', error);
    }
  };

  const handleEdit = (day: MarchDay) => {
    setEditedDay({ ...day });
    setEditingId(day.id);
  };

  const handleSave = async () => {
    if (editedDay) {
      try {
        await updateMarchDayMutation.mutateAsync({
          id: editedDay.id,
          data: editedDay
        });
        setEditingId(null);
        setEditedDay(null);
      } catch (error) {
        console.error('Failed to update day:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedDay(null);
  };

  const handleDelete = async (dayId: string) => {
    if (window.confirm('Are you sure you want to delete this day? This will affect the schedule of all participants.')) {
      try {
        await deleteMarchDayMutation.mutateAsync({ id: dayId });
      } catch (error) {
        console.error('Failed to delete day:', error);
      }
    }
  };

  const handleStartDateChange = async (newStartDate: string) => {
    if (marchId && march) {
      try {
        await updateMarchMutation.mutateAsync({
          id: marchId,
          data: {
            ...march,
            startDate: newStartDate
          }
        });
      } catch (error) {
        console.error('Failed to update start date:', error);
      }
    }
  };

  const handleInsertPositionChange = (position: number) => {
    setInsertPosition(position);
    
    // Auto-populate start point based on previous day's end point
    if (position > 0 && position <= days.length) {
      const prevDay = days[position - 1];
      setNewDay({
        ...newDay,
        route: {
          startPoint: prevDay.route.endPoint,
          endPoint: newDay.route?.endPoint || '',
          routePoints: newDay.route?.routePoints || []
        }
      });
    } else if (position === 0 && days.length > 0) {
      // Inserting at the beginning
      const firstDay = days[0];
      setNewDay({
        ...newDay,
        route: {
          startPoint: newDay.route?.startPoint || '',
          endPoint: firstDay.route.startPoint,
          routePoints: newDay.route?.routePoints || []
        }
      });
    }
  };

  const getInsertContext = () => {
    if (insertPosition === null) return null;
    
    if (days.length === 0) {
      return {
        type: 'first-day',
        description: 'This will be the first day of the march'
      };
    }
    
    if (insertPosition === 0) {
      return {
        type: 'before-first',
        prevDay: null,
        nextDay: days[0],
        description: `Inserting before Day 1 (${days[0].route.startPoint})`
      };
    }
    
    if (insertPosition === days.length) {
      return {
        type: 'after-last',
        prevDay: days[days.length - 1],
        nextDay: null,
        description: `Inserting after Day ${days.length} (${days[days.length - 1].route.endPoint})`
      };
    }
    
    const prevDay = days[insertPosition - 1];
    const nextDay = days[insertPosition];
    
    return {
      type: 'between',
      prevDay,
      nextDay,
      description: `Inserting between Day ${insertPosition} (${prevDay.route.endPoint}) and Day ${insertPosition + 1} (${nextDay.route.endPoint})`
    };
  };

  const insertContext = getInsertContext();

  if (daysLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading days...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-red-600 to-blue-600 p-3 rounded-full">
            <Calendar className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Day Management</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Add, edit, or remove march days. The system will automatically handle participant scheduling and route continuity.
        </p>
      </div>

      {/* Start Date Management */}
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-6 w-6 mr-3 text-blue-600" />
          March Start Date
        </h2>
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">Start Date:</label>
          <input
            type="date"
            value={march?.startDate || ''}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <span className="text-sm text-gray-500">
            All subsequent dates will be automatically updated
          </span>
        </div>
      </div>

      {/* Add New Day Section */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Plus className="h-6 w-6 mr-3 text-red-600" />
            Add New Day
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Cancel' : 'Add Day'}</span>
          </button>
        </div>

        {isAdding && (
          <div className="space-y-6">
            {/* Insert Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Insert Position</label>
              <select
                value={insertPosition || ''}
                onChange={(e) => handleInsertPositionChange(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select where to insert the new day...</option>
                {days.length === 0 ? (
                  <option value={0}>Add first day</option>
                ) : (
                  <>
                    <option value={0}>At the beginning (before Day 1)</option>
                    {days.map((day, index) => (
                      <option key={day.id} value={index + 1}>
                        After Day {index + 1} - {getRoutePointName(day, 'start')} → {getRoutePointName(day, 'end')}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Insert Context */}
            {insertContext && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Insert Context</h4>
                <p className="text-blue-700 text-sm mb-3">{insertContext.description}</p>
                
                {insertContext.type === 'between' && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">{insertContext.prevDay?.route.endPoint}</span>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">NEW DAY</span>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">{insertContext.nextDay?.route.endPoint}</span>
                  </div>
                )}
                
                {insertContext.type === 'before-first' && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">NEW DAY</span>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">{insertContext.nextDay?.route.endPoint}</span>
                  </div>
                )}
                
                {insertContext.type === 'after-last' && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">{insertContext.prevDay?.route.endPoint}</span>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">NEW DAY</span>
                  </div>
                )}
                
                {insertContext.type === 'first-day' && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 font-medium">FIRST DAY</span>
                  </div>
                )}
              </div>
            )}

            {/* Route Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Point *</label>
                <input
                  type="text"
                  value={newDay.route?.startPoint || ''}
                  onChange={(e) => setNewDay({ 
                    ...newDay, 
                    route: { 
                      startPoint: e.target.value,
                      endPoint: newDay.route?.endPoint || '',
                      routePoints: newDay.route?.routePoints || []
                    } 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Starting location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Point *</label>
                <input
                  type="text"
                  value={newDay.route?.endPoint || ''}
                  onChange={(e) => setNewDay({ 
                    ...newDay, 
                    route: { 
                      ...newDay.route, 
                      endPoint: e.target.value,
                      startPoint: newDay.route?.startPoint || '',
                      routePoints: newDay.route?.routePoints || []
                    } 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ending location"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddDay}
                disabled={!insertPosition && insertPosition !== 0 || createMarchDayMutation.isPending}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMarchDayMutation.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{createMarchDayMutation.isPending ? 'Adding...' : 'Add Day'}</span>
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewDay({});
                  setInsertPosition(null);
                }}
                className="btn-outline"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {days.map((day, index) => {
          const isEditing = editingId === day.id;
          const currentDay = isEditing ? editedDay! : day;
          const dayNumber = index + 1;
          // Note: We can't easily get day assignments without additional queries
          const dayMarchers: any[] = []; // Would need to query assignments
          const dayPartners: any[] = []; // Would need to query assignments

          // Helper functions to count medics and peacekeepers for this day
          const getDayMedicCount = () => {
            return dayMarchers.filter(m => m.medic).length;
          };

          const getDayPeacekeeperCount = () => {
            return dayMarchers.filter(m => m.peacekeeper).length;
          };

          // Helper function to get the march leader
          const getMarchLeader = () => {
            if (!day.marchLeaderId) return null;
            return marchers.find(m => m.id === day.marchLeaderId);
          };

          return (
            <div key={day.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {dayNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Day {dayNumber} - {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <p className="text-gray-600">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={currentDay.route.startPoint}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              route: { ...currentDay.route, startPoint: e.target.value } 
                            })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={currentDay.route.endPoint}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              route: { ...currentDay.route, endPoint: e.target.value } 
                            })}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      ) : (
                        `${getRoutePointName(day, 'start')} → ${getRoutePointName(day, 'end')}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/day/${day.id}`}
                    className="text-green-600 hover:text-green-800 p-2"
                    title="View Day Details"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={updateMarchDayMutation.isPending}
                        className="text-green-600 hover:text-green-800 p-2 disabled:opacity-50"
                        title="Save Changes"
                      >
                        {updateMarchDayMutation.isPending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800 p-2"
                        title="Cancel Edit"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(day)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Edit Day"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(day.id)}
                        disabled={deleteMarchDayMutation.isPending}
                        className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                        title="Delete Day"
                      >
                        {deleteMarchDayMutation.isPending ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  <span>Route details</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-purple-500" />
                  <span>{dayMarchers.length} marchers</span>
                </div>
              </div>

              {/* Daily Organizer and March Leader */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {day.dailyOrganizer?.name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2 text-green-500" />
                    <span>Organizer: {day.dailyOrganizer.name}</span>
                  </div>
                )}
                {getMarchLeader() && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>Leader: {getMarchLeader()?.name}</span>
                  </div>
                )}
              </div>

              {/* Participants Summary */}
              <div className="flex space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {dayMarchers.length} marchers
                </span>
                <span className="flex items-center">
                  <Building2 className="h-3 w-3 mr-1" />
                  {dayPartners.length} partners
                </span>
                {getDayMedicCount() > 0 && (
                  <span className="flex items-center">
                    <Stethoscope className="h-3 w-3 mr-1 text-red-500" />
                    {getDayMedicCount()} medic{getDayMedicCount() !== 1 ? 's' : ''}
                  </span>
                )}
                {getDayPeacekeeperCount() > 0 && (
                  <span className="flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-blue-500" />
                    {getDayPeacekeeperCount()} peacekeeper{getDayPeacekeeperCount() !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayManagement; 