import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { MapPin, Clock, Users, Building2, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { MarchDay, Meal, SpecialEvent } from '../types';
import RouteEditor from './RouteEditor';

const DayDetail: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const { marchData, updateDay, getDayNumber } = useMarchData();
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dayId]);

  const day = marchData.days.find(d => d.id === dayId);
  
  // Get marchers who are scheduled for this day
  const dayMarchers = marchData.marchers.filter(m => 
    m.marchingDays?.includes(dayId || '')
  );
  
  // Get organizations who are scheduled for this day
  const dayPartners = marchData.partnerOrganizations.filter(p => 
    p.partnerDays?.includes(dayId || '')
  );

  if (!day) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Day not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">Back to Overview</Link>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditedDay({ ...day });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedDay) {
      updateDay(day.id, editedDay);
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
    const updatedDay = {
      ...editedDay!,
      route: updatedRoute
    };
    
    // Update the local state
    setEditedDay(updatedDay);
    
    // Automatically save the route changes to the main data
    updateDay(day.id, updatedDay);
  };

  const currentDay = isEditing ? editedDay! : day;
  const dayNumber = getDayNumber(day.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Day {dayNumber} - {new Date(currentDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h1>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
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
                {isEditing ? (
                  <input
                    type="number"
                    value={currentDay.route.distance}
                    onChange={(e) => setEditedDay({ ...currentDay, route: { ...currentDay.route, distance: parseFloat(e.target.value) } })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{currentDay.route.distance} miles</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Duration (hours)</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.5"
                    value={currentDay.route.estimatedDuration}
                    onChange={(e) => setEditedDay({ ...currentDay, route: { ...currentDay.route, estimatedDuration: parseFloat(e.target.value) } })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">~{currentDay.route.estimatedDuration} hours</p>
                )}
              </div>
            </div>
          </div>

          {/* Route Editor */}
          <RouteEditor
            route={currentDay.route}
            onRouteUpdate={handleRouteUpdate}
            isEditing={isEditing}
          />

          {/* Meals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Meals</h2>
            <div className="space-y-6">
              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const meal = currentDay[mealType as keyof MarchDay] as Meal;
                return (
                  <div key={mealType} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">{mealType}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={meal.time}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              [mealType]: { ...meal, time: e.target.value } 
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{meal.time}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={meal.location}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              [mealType]: { ...meal, location: e.target.value } 
                            })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{meal.location}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        {isEditing ? (
                          <textarea
                            value={meal.description}
                            onChange={(e) => setEditedDay({ 
                              ...currentDay, 
                              [mealType]: { ...meal, description: e.target.value } 
                            })}
                            rows={2}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{meal.description}</p>
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
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Marchers ({dayMarchers.length})
              </h2>
              <Link 
                to="/marcher-schedule" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Manage Schedule
              </Link>
            </div>
            {dayMarchers.length === 0 ? (
              <p className="text-gray-500 text-sm">No marchers scheduled for this day.</p>
            ) : (
              <div className="space-y-3">
                {dayMarchers.map((marcher) => (
                  <div key={marcher.id} className="border-l-4 border-purple-500 pl-3">
                    <h3 className="font-medium text-gray-900">{marcher.name}</h3>
                    <p className="text-sm text-gray-600">{marcher.email}</p>
                    {marcher.dietaryRestrictions && (
                      <p className="text-xs text-orange-600 mt-1">
                        Dietary: {marcher.dietaryRestrictions}
                      </p>
                    )}
                  </div>
                ))}
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
              <Link 
                to="/org-schedule" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Manage Schedule
              </Link>
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