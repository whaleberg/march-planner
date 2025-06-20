import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Users, Building2, Edit, Save, X, Plus, Trash2, ChevronLeft, ChevronRight, Stethoscope, Shield, User, Mail, Phone, Crown } from 'lucide-react';
import { MarchDay, Meal, SpecialEvent } from '../types';
import RouteEditor from './RouteEditor';

const DayDetail: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const { marchData, isLoading, updateDay, getDayNumber, getDayDistance, getDayWalkingTime } = useMarchData();
  const { canEdit } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDay, setEditedDay] = useState<MarchDay | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<SpecialEvent>>({
    title: '',
    time: '',
    location: '',
    description: '',
    organizer: ''
  });

  // Helper function to safely format dates
  const formatDayDate = (dateString: string | undefined) => {
    if (isLoading) return 'Loading...';
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

  const day = marchData.days.find(d => d.id === dayId);
  const dayIndex = marchData.days.findIndex(d => d.id === dayId);
  const prevDay = dayIndex > 0 ? marchData.days[dayIndex - 1] : null;
  const nextDay = dayIndex < marchData.days.length - 1 ? marchData.days[dayIndex + 1] : null;
  
  // Get marchers who are scheduled for this day
  const dayMarchers = marchData.marchers.filter(m => 
    m.marchingDays?.includes(dayId || '')
  );
  
  // Get organizations who are scheduled for this day
  const dayPartners = marchData.partnerOrganizations.filter(p => 
    p.partnerDays?.includes(dayId || '')
  );

  // Helper functions to count medics and peacekeepers for this day
  const getDayMedicCount = () => {
    return dayMarchers.filter(m => m.medic).length;
  };

  const getDayPeacekeeperCount = () => {
    return dayMarchers.filter(m => m.peacekeeper).length;
  };

  // Helper function to get the march leader marcher
  const getMarchLeader = () => {
    if (!day?.marchLeaderId) return null;
    return marchData.marchers.find(m => m.id === day.marchLeaderId);
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

  // Show loading state if data is not ready
  if (isLoading || !marchData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading march data...</p>
          </div>
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

  const handleEdit = () => {
    // Deep copy the day object to prevent sharing references
    const deepCopy = {
      ...day,
      id: day.id, // Ensure the id is preserved
      route: {
        ...day.route,
        routePoints: [...(day.route.routePoints || [])] // Deep copy the routePoints array
      },
      specialEvents: [...day.specialEvents], // Deep copy special events array
      marchers: [...day.marchers], // Deep copy marchers array
      partnerOrganizations: [...day.partnerOrganizations] // Deep copy partner organizations array
    };
    setEditedDay(deepCopy);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedDay) {
      const savedDay = {
        ...editedDay,
        id: day.id // Ensure the id is preserved
      };
      updateDay(day.id, savedDay);
      setIsEditing(false);
      setEditedDay(null);
      setEditingEventId(null);
      setNewEvent({ title: '', time: '', location: '', description: '', organizer: '' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDay(null);
    setEditingEventId(null);
    setNewEvent({ title: '', time: '', location: '', description: '', organizer: '' });
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.time && newEvent.location && newEvent.description && newEvent.organizer) {
      const event: SpecialEvent = {
        id: `event-${Date.now()}`,
        title: newEvent.title,
        time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description,
        organizer: newEvent.organizer
      };
      
      setEditedDay({
        ...editedDay!,
        specialEvents: [...editedDay!.specialEvents, event]
      });
      
      setNewEvent({ title: '', time: '', location: '', description: '', organizer: '' });
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
        organizer: (document.getElementById(`event-organizer-${eventId}`) as HTMLInputElement)?.value || event.organizer
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

  const handleRouteUpdate = (updatedRoute: any) => {
    // Deep copy the route to prevent sharing references
    const deepCopiedRoute = {
      ...updatedRoute,
      routePoints: updatedRoute.routePoints ? 
        updatedRoute.routePoints.map((point: any) => ({ ...point })) : []
    };
    
    // Use editedDay if available, otherwise use the original day
    const baseDay = editedDay || day;
    
    const updatedDay = {
      ...baseDay,
      id: day.id, // Ensure the id is preserved
      date: baseDay.date, // Ensure the date is preserved
      route: deepCopiedRoute
    };
    
    // Update the local state if we're in editing mode
    if (isEditing) {
      setEditedDay(updatedDay);
    }
    
    // Automatically save the route changes to the main data
    updateDay(day.id, updatedDay);
  };

  const currentDay = isEditing && editedDay ? editedDay : day;
  const dayNumber = getDayNumber(day.id);

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
              title={`Go to Day ${getDayNumber(prevDay.id)}`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Day {getDayNumber(prevDay.id)}</span>
            </button>
          )}
        </div>

        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Day {dayNumber} - {formatDayDate(currentDay.date)}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Next Day Button */}
          {nextDay && (
            <button
              onClick={() => navigate(`/day/${nextDay.id}`)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
              title={`Go to Day ${getDayNumber(nextDay.id)}`}
            >
              <span className="hidden sm:inline">Day {getDayNumber(nextDay.id)}</span>
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
                <p className="mt-1 text-gray-900">{getDayDistance(currentDay).toFixed(1)} miles</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Walking Time (hours)</label>
                <p className="mt-1 text-gray-900">~{getDayWalkingTime(currentDay)} hours walking</p>
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
                  {dayMarchers.map((marcher) => (
                    <option key={marcher.id} value={marcher.id}>
                      {marcher.name}
                    </option>
                  ))}
                </select>
                {dayMarchers.length === 0 && (
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
            ready={!isLoading && !!day}
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
                  disabled={!newEvent.title || !newEvent.time || !newEvent.location || !newEvent.description || !newEvent.organizer}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-1 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Event</span>
                </button>
              )}
            </div>

            {/* Add New Event Form */}
            {isEditing && (
              <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-3">Add New Event</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="e.g., 7:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organizer</label>
                    <input
                      type="text"
                      value={newEvent.organizer}
                      onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Event organizer"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Event description"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentDay.specialEvents.length === 0 ? (
              <p className="text-gray-500">No special events scheduled for this day.</p>
            ) : (
              <div className="space-y-4">
                {currentDay.specialEvents.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    {editingEventId === event.id ? (
                      // Edit mode
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Organizer</label>
                            <input
                              id={`event-organizer-${event.id}`}
                              type="text"
                              defaultValue={event.organizer}
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
                            <p className="text-sm text-gray-500 mt-1">Organized by: {event.organizer}</p>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Marchers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Marchers ({dayMarchers.length})
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
            {dayMarchers.length === 0 ? (
              <p className="text-gray-500 text-sm">No marchers scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {canEdit() ? (
                  // Show full marcher list for authenticated users
                  dayMarchers.map((marcher) => (
                    <div key={marcher.id} className="border-l-4 border-purple-500 pl-3">
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
                  ))
                ) : (
                  // Show only count and message for public users
                  <div className="text-center py-4">
                    <p className="text-gray-600 text-sm">
                      {dayMarchers.length} marcher{dayMarchers.length !== 1 ? 's' : ''} participating
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Sign in to view participant details
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Partner Organizations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Partner Organizations ({dayPartners.length})
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
            {dayPartners.length === 0 ? (
              <p className="text-gray-500 text-sm">No partner organizations scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {dayPartners.map((org) => (
                  <div key={org.id} className="border-l-4 border-orange-500 pl-3">
                    <h3 className="font-medium text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-600">{org.description}</p>
                    {org.contactPerson && (
                      <p className="text-xs text-gray-500 mt-1">Contact: {org.contactPerson}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayDetail; 