import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Users, Building2, Edit, Save, X, Plus, Trash2, ChevronLeft, ChevronRight, Stethoscope, Shield, User, Mail, Phone, Crown } from 'lucide-react';
import { MarchDay, MarcherDayAssignment, OrganizationDayAssignment } from '@march-organizer/shared';
import { 
  mapMarchersByAssignments, 
  mapOrganizationsByAssignments, 
  getUniqueEntities,
  getEntityById 
} from '../utils/entityMapping';
import { Meal } from '../types';
import RouteEditor from './RouteEditor';
import DayVehicleSchedule from './DayVehicleSchedule';

// Type definitions for the component
type SpecialEvent = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
  organizer?: string;
};
import { 
  useMarchDay, 
  useMarchDays, 
  useUpdateMarchDay,
  useMarcherDayAssignments,
  useOrganizationDayAssignments,
  useDayStats,
  useMarchers,
  usePartnerOrganizations
  } from '../hooks/useMarchData';
  import { useMarches } from '../hooks/useMarchData';

const DayDetail: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>() ;
  const { canEdit, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Early return if no dayId - BEFORE any other hooks are called
  if (!dayId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Day</h1>
          <p className="text-gray-600 mb-4">No day ID provided.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedDay, setEditedDay] = useState<MarchDay | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<SpecialEvent>>({
    title: '',
    time: '',
    location: '',
    description: ''
  });

  // Get march data to find the marchId
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // Public data - always loaded
  const { data: dayData, isLoading: dayLoading, error: dayError } = useMarchDay(dayId || '');
  const { data: daysData, isLoading: daysLoading } = useMarchDays(marchId || '');
  const { data: dayStats } = useDayStats(dayId || '');
  const { data: organizationsData } = usePartnerOrganizations(marchId);

  // Private data - only loaded when authenticated
  const { data: marcherAssignments } = useMarcherDayAssignments(
    isAuthenticated ? dayId : undefined
  );
  const { data: marchersData } = useMarchers(
    isAuthenticated ? marchId : undefined
  );
  const { data: organizationAssignments } = useOrganizationDayAssignments(
    isAuthenticated ? dayId : undefined
  );

  // Mutations
  const updateMarchDayMutation = useUpdateMarchDay();

  // Helper function to safely format dates
  const formatDayDate = (dateString: string | undefined) => {
    if (dayLoading) return 'Loading...';
    if (!dateString || dateString.trim() === '') return 'No date set';
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dayId]);

  const day = dayData?.data;
  

  const days = daysData?.data || [];
  const dayIndex = days.findIndex(d => d.id === dayId);
  const prevDay = dayIndex > 0 ? days[dayIndex - 1] : null;
  const nextDay = dayIndex < days.length - 1 ? days[dayIndex + 1] : null;
  

  
  // Get marchers who are scheduled for this day (only if authenticated)
  const dayMarchers = marcherAssignments?.data || [];
  const marchers = marchersData?.data || [];
  
  // Use generic mapping functions to get unique assignments for this day
  const marcherMappings = mapMarchersByAssignments(marchers, dayMarchers, { dayId });
  const uniqueDayMarchers = marcherMappings.filter((mapping, index, self) => 
    index === self.findIndex(m => m.relationship.marcherId === mapping.relationship.marcherId)
  ).map(mapping => mapping.relationship);
  
  // Get organizations who are scheduled for this day
  const dayPartners = organizationAssignments?.data || [];
  const organizations = organizationsData?.data || [];
  
  // Use generic mapping functions to get unique assignments for this day
  const organizationMappings = mapOrganizationsByAssignments(organizations, dayPartners, { dayId });
  const uniqueDayPartners = organizationMappings.filter((mapping, index, self) => 
    index === self.findIndex(o => o.relationship.organizationId === mapping.relationship.organizationId)
  ).map(mapping => mapping.relationship);
  

  
  // Helper function to get marcher data by ID
  const getMarcherById = (marcherId: string) => {
    return getEntityById(marchers, marcherId);
  };
  
  // Helper function to get organization data by ID
  const getOrganizationById = (organizationId: string) => {
    return getEntityById(organizations, organizationId);
  };

  // Helper functions to count medics and peacekeepers for this day
  const getDayMedicCount = () => {
    return dayStats?.data.medics || 0;
  };

  const getDayPeacekeeperCount = () => {
    return dayStats?.data.peacekeepers || 0;
  };

  const getDayMarcherCount = () => {
    return dayStats?.data.marchers || 0;
  };

  // Helper function to get the march leader marcher
  const getMarchLeader = () => {
    if (!day?.marchLeaderId) return null;
    return getMarcherById(day.marchLeaderId);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && prevDay) {
        navigate(`/day/${prevDay.id}`);
      } else if (event.key === 'ArrowRight' && nextDay) {
        navigate(`/day/${nextDay.id}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDay, nextDay, navigate]);



  const handleEdit = () => {
    // Deep copy the day object to prevent sharing references
    const deepCopy = {
      ...day!,
      id: day!.id, // Ensure the id is preserved
      route: {
        ...day!.route,
        routePoints: [...(day!.route.routePoints || [])] // Deep copy the routePoints array
      },
      specialEvents: [...day!.specialEvents], // Deep copy special events array
    };
    setEditedDay(deepCopy);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedDay && dayId) {
      try {
        await updateMarchDayMutation.mutateAsync({
          id: dayId,
          data: editedDay
        });
        setIsEditing(false);
        setEditedDay(null);
        setEditingEventId(null);
        setNewEvent({ title: '', time: '', location: '', description: '' });
      } catch (error) {
        console.error('Failed to save day:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDay(null);
    setEditingEventId(null);
    setNewEvent({ title: '', time: '', location: '', description: '' });
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.time && newEvent.location && newEvent.description) {
      const event = {
        id: `event-${Date.now()}`,
        title: newEvent.title,
        time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description
      };
      
      setEditedDay({
        ...editedDay!,
        specialEvents: [...editedDay!.specialEvents, event]
      });
      
      setNewEvent({ title: '', time: '', location: '', description: '' });
    }
  };

  const handleEditEvent = (eventId: string) => {
    setEditingEventId(eventId);
  };

  const handleSaveEvent = (eventId: string) => {
    const eventIndex = editedDay!.specialEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      const updatedEvents = [...editedDay!.specialEvents];
      const event = updatedEvents[eventIndex];
      updatedEvents[eventIndex] = {
        ...event,
        title: (document.getElementById(`event-title-${eventId}`) as HTMLInputElement)?.value || event.title,
        time: (document.getElementById(`event-time-${eventId}`) as HTMLInputElement)?.value || event.time,
        location: (document.getElementById(`event-location-${eventId}`) as HTMLInputElement)?.value || event.location,
        description: (document.getElementById(`event-description-${eventId}`) as HTMLTextAreaElement)?.value || event.description,
        
      };
      
      setEditedDay({
        ...editedDay!,
        specialEvents: updatedEvents
      });
      setEditingEventId(null);
    }
  };

  const handleCancelEvent = () => {
    setEditingEventId(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEditedDay({
      ...editedDay!,
      specialEvents: editedDay!.specialEvents.filter(e => e.id !== eventId)
    });
  };

  const handleRouteUpdate = useCallback((updatedRoute: any) => {
    // Deep copy the route to prevent sharing references
    const deepCopiedRoute = {
      ...updatedRoute,
      routePoints: updatedRoute.routePoints ? 
        updatedRoute.routePoints.map((point: any) => ({ ...point })) : []
    };
    
    // Use editedDay if available, otherwise use the original day
    const baseDay = editedDay || day!;
    
    const updatedDay = {
      ...baseDay,
      id: day!.id, // Ensure the id is preserved
      date: baseDay.date, // Ensure the date is preserved
      route: deepCopiedRoute
    };
    
    // Update the local state if we're in editing mode
    if (isEditing) {
      setEditedDay(updatedDay);
    }
    
    // Automatically save the route changes to the main data
    // updateDay(day.id, updatedDay); // This line was removed as per the new_code
  }, [editedDay, day, isEditing]);

  const currentDay = isEditing && editedDay ? editedDay : day!;
  const dayNumber = dayIndex + 1; // Calculate day number from index

  // Show loading state if data is not ready
  if (dayLoading || daysLoading || !day) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading day data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (dayError) {
    console.error('DayDetail Error:', dayError);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Day</h1>
          <p className="text-gray-600 mb-4">There was an error loading the day data: {dayError.message}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Overview
          </Link>
        </div>
      </div>
    );
  }
  
  if (!day) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Day Not Found</h1>
          <p className="text-gray-600 mb-4">The requested day could not be found.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            to="/" 
            state={{ scrollToDay: dayId }}
            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Overview</span>
          </Link>
          
          {/* Previous Day Button */}
          {prevDay && (
            <button
              onClick={() => navigate(`/day/${prevDay.id}`)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
              title={`Go to Day ${dayIndex}`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Day {dayIndex}</span>
            </button>
          )}
        </div>

        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Day {dayNumber} - {formatDayDate(day.date)}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Next Day Button */}
          {nextDay && (
            <button
              onClick={() => navigate(`/day/${nextDay.id}`)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
              title={`Go to Day ${dayIndex + 2}`}
            >
              <span className="hidden sm:inline">Day {dayIndex + 2}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {/* Edit Buttons */}
          {canEdit() && (
            isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Route Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Point</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentDay.route.startPoint}
                    onChange={(e) => setEditedDay({ ...currentDay, route: { ...currentDay.route, startPoint: e.target.value } })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{currentDay.route.startPoint}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Point</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentDay.route.endPoint}
                    onChange={(e) => setEditedDay({ ...currentDay, route: { ...currentDay.route, endPoint: e.target.value } })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{currentDay.route.endPoint}</p>
                )}
              </div>
                              <div>
                  <label className="block text-sm font-medium text-gray-700">Distance (miles)</label>
                  <p className="mt-1 text-gray-900">~15 miles</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Walking Time (hours)</label>
                  <p className="mt-1 text-gray-900">~5 hours walking</p>
                </div>
            </div>
          </div>

          {/* Daily Organizer */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <User className="h-5 w-5 mr-2" />
              Daily Organizer
            </h2>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={currentDay.dailyOrganizer?.name || ''}
                    onChange={(e) => setEditedDay({
                      ...currentDay,
                      dailyOrganizer: {
                        name: e.target.value,
                        email: currentDay.dailyOrganizer?.email || '',
                        phone: currentDay.dailyOrganizer?.phone || ''
                      }
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Organizer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={currentDay.dailyOrganizer?.email || ''}
                    onChange={(e) => setEditedDay({
                      ...currentDay,
                      dailyOrganizer: {
                        name: currentDay.dailyOrganizer?.name || '',
                        email: e.target.value,
                        phone: currentDay.dailyOrganizer?.phone || ''
                      }
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="organizer@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={currentDay.dailyOrganizer?.phone || ''}
                    onChange={(e) => setEditedDay({
                      ...currentDay,
                      dailyOrganizer: {
                        name: currentDay.dailyOrganizer?.name || '',
                        email: currentDay.dailyOrganizer?.email || '',
                        phone: e.target.value
                      }
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            ) : (
              <div>
                {currentDay.dailyOrganizer?.name ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-900">{currentDay.dailyOrganizer.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{currentDay.dailyOrganizer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{currentDay.dailyOrganizer.phone}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No daily organizer assigned</p>
                )}
              </div>
            )}
          </div>

          {/* March Leader */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <Crown className="h-5 w-5 mr-2" />
              March Leader
            </h2>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select March Leader</label>
                <select
                  value={currentDay.marchLeaderId || ''}
                  onChange={(e) => setEditedDay({
                    ...currentDay,
                    marchLeaderId: e.target.value || undefined
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">No march leader assigned</option>
                  {uniqueDayMarchers.map((marcherAssignment) => {
                    const marcher = getMarcherById(marcherAssignment.marcherId);
                    return (
                      <option key={marcherAssignment.id} value={marcherAssignment.marcherId}>
                        {marcher?.name || 'Unknown Marcher'}
                      </option>
                    );
                  })}
                </select>
                {uniqueDayMarchers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No marchers scheduled for this day</p>
                )}
              </div>
            ) : (
              <div>
                {getMarchLeader() ? (
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 mr-3 text-yellow-600" />
                    <div>
                      <span className="font-medium text-gray-900">{getMarchLeader()?.name}</span>
                      <div className="text-sm text-gray-600">{getMarchLeader()?.email}</div>
                      {/* Training Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getMarchLeader()?.medic && (
                          <div className="flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            Medic
                          </div>
                        )}
                        {getMarchLeader()?.peacekeeper && (
                          <div className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            <Shield className="h-3 w-3 mr-1" />
                            Peacekeeper
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No march leader assigned</p>
                )}
              </div>
            )}
          </div>

          {/* Route Editor */}
          <RouteEditor
            route={currentDay.route}
            onRouteUpdate={handleRouteUpdate}
            ready={!dayLoading && !!day}
          />

          {/* Meals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meals</h2>
            <div className="space-y-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const meal = currentDay[mealType as keyof MarchDay] as Meal;
                if (!meal) return null; // Skip if meal is undefined
                return (
                  <div key={mealType} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">{mealType}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={meal.time || ''}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              [mealType]: { ...meal, time: e.target.value } 
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{meal.time || 'Not specified'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={meal.location || ''}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              [mealType]: { ...meal, location: e.target.value } 
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{meal.location || 'Not specified'}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        {isEditing ? (
                          <textarea
                            value={meal.description || ''}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              [mealType]: { ...meal, description: e.target.value } 
                            })}
                            rows={2}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{meal.description || 'No description'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Special Events</h2>
              {isEditing && (
                <button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title || !newEvent.time || !newEvent.location || !newEvent.description}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Event</span>
                </button>
              )}
            </div>
            {currentDay.specialEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No special events scheduled for this day.</p>
            ) : (
              <div className="space-y-4">
                {currentDay.specialEvents.map((event) => (
                  <div key={event.id} className="border-l-4 border-green-500 pl-4">
                    {editingEventId === event.id ? (
                      // Edit mode
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                              id={`event-title-${event.id}`}
                              type="text"
                              defaultValue={event.title}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Time</label>
                            <input
                              id={`event-time-${event.id}`}
                              type="text"
                              defaultValue={event.time}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                              id={`event-location-${event.id}`}
                              type="text"
                              defaultValue={event.location}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                                                      
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                              id={`event-description-${event.id}`}
                              defaultValue={event.description}
                              rows={2}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveEvent(event.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm flex items-center space-x-1"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={handleCancelEvent}
                            className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm flex items-center space-x-1"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.time} at {event.location}</p>
                            <p className="text-gray-700 mt-2">{event.description}</p>
                            
                          </div>
                          {isEditing && (
                            <div className="flex space-x-1 ml-4">
                              <button
                                onClick={() => handleEditEvent(event.id)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit event"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(event.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete event"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Schedule */}
          {canEdit() && (
            <DayVehicleSchedule dayId={day.id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Marchers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Marchers ({getDayMarcherCount()})
                </h2>
                {(getDayMedicCount() > 0 || getDayPeacekeeperCount() > 0) && (
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    {getDayMedicCount() > 0 && (
                      <span className="flex items-center">
                        <Stethoscope className="h-4 w-4 mr-1 text-red-500" />
                        {getDayMedicCount()} medic{getDayMedicCount() !== 1 ? 's' : ''}
                      </span>
                    )}
                    {getDayPeacekeeperCount() > 0 && (
                      <span className="flex items-center">
                        <Shield className="h-4 w-4 mr-1 text-blue-500" />
                        {getDayPeacekeeperCount()} peacekeeper{getDayPeacekeeperCount() !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {canEdit() && (
                <Link 
                  to="/marcher-schedule" 
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Manage Schedule
                </Link>
              )}
            </div>
            {!isAuthenticated ? (
              // Show public view for unauthenticated users
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">
                  {getDayMarcherCount()} marcher{getDayMarcherCount() !== 1 ? 's' : ''} participating
                </p>
                <Link 
                  to="/login" 
                  state={{ from: { pathname: `/day/${dayId}` } }}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                >
                  Sign in to view participant details
                </Link>
              </div>
            ) : uniqueDayMarchers.length === 0 ? (
              <p className="text-gray-500 text-sm">No marchers scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {canEdit() ? (
                  // Show full marcher list for authenticated users with edit permissions
                  uniqueDayMarchers.map((marcherAssignment) => {
                    const marcher = getMarcherById(marcherAssignment.marcherId);
                    if (!marcher) return null;
                    return (
                      <div key={marcherAssignment.id} className="border-l-4 border-purple-500 pl-3">
                        <h3 className="font-medium text-gray-900">{marcher.name}</h3>
                        <p className="text-sm text-gray-600">{marcher.email}</p>
                        {/* Training Badges */}
                        <div className="flex flex-wrap gap-1 mt-1">
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
                        {marcher.dietaryRestrictions && (
                          <p className="text-xs text-orange-600 mt-1">
                            Dietary: {marcher.dietaryRestrictions}
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Show marcher list for authenticated users without edit permissions
                  uniqueDayMarchers.map((marcherAssignment) => {
                    const marcher = getMarcherById(marcherAssignment.marcherId);
                    if (!marcher) return null;
                    return (
                      <div key={marcherAssignment.id} className="border-l-4 border-purple-500 pl-3">
                        <h3 className="font-medium text-gray-900">{marcher.name}</h3>
                        <p className="text-sm text-gray-600">{marcher.email}</p>
                        {/* Training Badges */}
                        <div className="flex flex-wrap gap-1 mt-1">
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
                        {marcher.dietaryRestrictions && (
                          <p className="text-xs text-orange-600 mt-1">
                            Dietary: {marcher.dietaryRestrictions}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Partner Organizations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Partner Organizations ({isAuthenticated ? uniqueDayPartners.length : 'See details'})
              </h2>
              {canEdit() && (
                <Link 
                  to="/org-schedule" 
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Manage Schedule
                </Link>
              )}
            </div>
            {!isAuthenticated ? (
              // Show public view for unauthenticated users
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">
                  Partner organizations supporting this day
                </p>
                <Link 
                  to="/login" 
                  state={{ from: { pathname: `/day/${dayId}` } }}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                >
                  Sign in to view partner details
                </Link>
              </div>
            ) : uniqueDayPartners.length === 0 ? (
              <p className="text-gray-500 text-sm">No partner organizations scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {uniqueDayPartners.map((orgAssignment) => {
                  const organization = getOrganizationById(orgAssignment.organizationId);
                  if (!organization) return null;
                  return (
                    <div key={orgAssignment.id} className="border-l-4 border-orange-500 pl-3">
                      <h3 className="font-medium text-gray-900">{organization.name}</h3>
                      <p className="text-sm text-gray-600">{organization.description}</p>
                      {organization.contactPerson && (
                        <p className="text-xs text-gray-500 mt-1">Contact: {organization.contactPerson}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetail; 