import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Building2, Clock, ArrowRight, Flag, Heart, Database, Navigation, Edit, Save, X, Stethoscope, Shield } from 'lucide-react';
import Map from './Map';
import SummaryStats from './SummaryStats';
import { RoutePoint, MarchDay } from '../types';
import { getRoutePointName } from '../utils/routeUtils';

const Overview: React.FC = () => {
  const { marchData, isLoading, getTotalDistance, getDayDistance, getDayWalkingTime, getDayNumber, updateMarchData } = useMarchData();
  const { canEdit } = useAuth();
  const location = useLocation();
  const dayRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [clickedPolyline, setClickedPolyline] = useState<{
    startPoint: RoutePoint;
    endPoint: RoutePoint;
    dayIndex: number;
  } | null>(null);
  
  // Editing state
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [isEditingCallToAction, setIsEditingCallToAction] = useState(false);
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [isEditingItinerary, setIsEditingItinerary] = useState(false);
  const [editedData, setEditedData] = useState(marchData);

  // Helper functions to count medics and peacekeepers for a day
  const getDayMedicCount = (dayId: string) => {
    return marchData.marchers.filter(m => 
      m.marchingDays?.includes(dayId) && m.medic
    ).length;
  };

  const getDayPeacekeeperCount = (dayId: string) => {
    return marchData.marchers.filter(m => 
      m.marchingDays?.includes(dayId) && m.peacekeeper
    ).length;
  };

  // Helper functions to get total counts across all days
  const getTotalMedicCount = () => {
    return marchData.marchers.filter(m => m.medic).length;
  };

  const getTotalPeacekeeperCount = () => {
    return marchData.marchers.filter(m => m.peacekeeper).length;
  };

  // Update edited data when marchData changes
  useEffect(() => {
    setEditedData(marchData);
  }, [marchData]);

  const handleEditMission = () => {
    setIsEditingMission(true);
    setEditedData(marchData);
  };

  const handleEditCallToAction = () => {
    setIsEditingCallToAction(true);
    setEditedData(marchData);
  };

  const handleEditHero = () => {
    setIsEditingHero(true);
    setEditedData(marchData);
  };

  const handleEditItinerary = () => {
    setIsEditingItinerary(true);
    setEditedData(marchData);
  };

  const handleSave = () => {
    updateMarchData(editedData);
    setIsEditingMission(false);
    setIsEditingCallToAction(false);
    setIsEditingHero(false);
    setIsEditingItinerary(false);
  };

  const handleCancel = () => {
    setEditedData(marchData);
    setIsEditingMission(false);
    setIsEditingCallToAction(false);
    setIsEditingHero(false);
    setIsEditingItinerary(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMissionStatementChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      missionStatement: {
        ...prev.missionStatement,
        [field]: value
      }
    }));
  };

  const handleCallToActionChange = (field: string, value: string) => {
    setEditedData(prev => ({
      ...prev,
      callToAction: {
        ...prev.callToAction,
        [field]: value
      }
    }));
  };

  // Helper functions to safely access flavor text fields with fallbacks
  const getMissionStatement = () => {
    return marchData.missionStatement || {
      title: "More than a march—a people's movement",
      subtitle: "Join us as we walk together, strengthening community bonds and demonstrating our commitment to democracy.",
      description: "Every step counts, every voice matters."
    };
  };

  const getCallToAction = () => {
    return marchData.callToAction || {
      title: "Join the Movement",
      description: "Whether you can walk for an hour, a day, or the entire journey, your participation makes a difference."
    };
  };

  const getItineraryDescription = () => {
    return marchData.itineraryDescription || "Join us for an hour, a day, a week, or the whole way. Each day offers unique opportunities to connect with communities and make your voice heard.";
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | undefined, options: Intl.DateTimeFormatOptions = {}) => {
    if (!dateString) return 'Loading...';
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Helper function to safely format day dates
  const formatDayDate = (day: MarchDay) => {
    if (!day?.date) return 'Loading...';
    try {
      const date = new Date(day.date + 'T00:00:00');
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

  // Handle scroll to specific day when coming from day detail
  useEffect(() => {
    const scrollToDay = location.state?.scrollToDay;
    if (scrollToDay && dayRefs.current[scrollToDay]) {
      setTimeout(() => {
        dayRefs.current[scrollToDay]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Add a temporary highlight effect
        const dayElement = dayRefs.current[scrollToDay];
        if (dayElement) {
          dayElement.classList.add('bg-blue-50', 'border-l-4', 'border-blue-500');
          setTimeout(() => {
            dayElement.classList.remove('bg-blue-50', 'border-l-4', 'border-blue-500');
          }, 2000);
        }
      }, 100);
    }
  }, [location.state]);

  // Create route points for the entire march using actual coordinates
  const { routePoints, mapCenter, polylinePath } = useMemo(() => {
    const allPoints: RoutePoint[] = [];
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    let hasValidCoordinates = false;
    
    // Collect all unique locations for the march
    const uniqueLocations: Array<{
      coordinates: { lat: number; lng: number };
      name: string;
      dayNumber: number;
      isStart: boolean;
      isEnd: boolean;
    }> = [];
    
    marchData.days.forEach((day, index) => {
      const startPoint = day.route.routePoints.find(point => point.type === 'start');
      const endPoint = day.route.routePoints.find(point => point.type === 'end');
      
      if (startPoint && startPoint.coordinates.lat !== 0 && startPoint.coordinates.lng !== 0) {
        uniqueLocations.push({
          coordinates: startPoint.coordinates,
          name: startPoint.name || day.route.startPoint,
          dayNumber: index + 1,
          isStart: true,
          isEnd: false
        });
      }
      
      if (endPoint && endPoint.coordinates.lat !== 0 && endPoint.coordinates.lng !== 0) {
        uniqueLocations.push({
          coordinates: endPoint.coordinates,
          name: endPoint.name || day.route.endPoint,
          dayNumber: index + 1,
          isStart: false,
          isEnd: true
        });
      }
    });
    
    // Deduplicate locations that are very close to each other (within ~100 meters)
    const deduplicatedLocations: typeof uniqueLocations = [];
    
    uniqueLocations.forEach(location => {
      const isDuplicate = deduplicatedLocations.some(existing => {
        const latDiff = Math.abs(existing.coordinates.lat - location.coordinates.lat);
        const lngDiff = Math.abs(existing.coordinates.lng - location.coordinates.lng);
        // Roughly 100 meters in degrees (very approximate)
        return latDiff < 0.001 && lngDiff < 0.001;
      });
      
      if (!isDuplicate) {
        deduplicatedLocations.push(location);
      }
    });
    
    // Create route points from deduplicated locations
    deduplicatedLocations.forEach((location, index) => {
      let pointType: RoutePoint['type'] = 'waypoint';
      if (index === 0) pointType = 'start';
      else if (index === deduplicatedLocations.length - 1) pointType = 'end';
      
      allPoints.push({
        id: `overview-point-${index}`,
        name: location.name,
        coordinates: location.coordinates,
        type: pointType,
        description: `Day ${location.dayNumber} ${location.isStart ? 'Start' : 'End'}`,
        estimatedTime: new Date(marchData.days[location.dayNumber - 1].date + 'T00:00:00').toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
      
      // Update bounds
      minLat = Math.min(minLat, location.coordinates.lat);
      maxLat = Math.max(maxLat, location.coordinates.lat);
      minLng = Math.min(minLng, location.coordinates.lng);
      maxLng = Math.max(maxLng, location.coordinates.lng);
      hasValidCoordinates = true;
    });
    
    // Generate polyline path by connecting points in sequence
    let polylinePath = '';
    if (allPoints.length > 1) {
      try {
        // Create a simple polyline by connecting points with straight lines
        const path = allPoints.map(point => ({
          lat: point.coordinates.lat,
          lng: point.coordinates.lng
        }));
        
        // Encode the path using Google's polyline encoding
        const google = (window as any).google;
        if (google && google.maps && google.maps.geometry) {
          polylinePath = google.maps.geometry.encoding.encodePath(path);
        }
      } catch (error) {
        console.warn('Failed to generate polyline path:', error);
      }
    }
    
    // Calculate center based on bounds if we have valid coordinates
    let center = marchData.mapSettings?.mapCenter || { lat: 42.3601, lng: -71.0589 }; // Boston
    if (hasValidCoordinates) {
      center = {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
      };
    }
    
    return { routePoints: allPoints, mapCenter: center, polylinePath };
  }, [marchData.days, marchData.mapSettings?.mapCenter]);

  // Show loading state if data is not ready
  if (isLoading || !marchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading march data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Polyline interaction handlers
  const handlePolylineHover = (_startPoint: RoutePoint, _endPoint: RoutePoint, dayIndex: number) => {
    setHoveredDayIndex(dayIndex);
  };

  const handlePolylineClick = (startPoint: RoutePoint, endPoint: RoutePoint, dayIndex: number) => {
    setClickedPolyline({ startPoint, endPoint, dayIndex });
    
    // Auto-clear the clicked state after 3 seconds
    setTimeout(() => {
      setClickedPolyline(null);
    }, 3000);
  };

  const handlePolylineLeave = () => {
    setHoveredDayIndex(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-red-600 to-blue-600 p-3 rounded-full">
            <Flag className="h-12 w-12 text-white" />
          </div>
          {canEdit() && (
            <div className="ml-4 flex space-x-2">
              {isEditingHero ? (
                <>
                  <button
                    onClick={handleSave}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Save Changes"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-gray-600 hover:text-gray-800 p-1"
                    title="Cancel Edit"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditHero}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Content"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {isEditingHero ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editedData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="text-5xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-3xl"
              placeholder="March title"
            />
            <textarea
              value={editedData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="text-xl text-gray-600 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-3xl resize-none"
              rows={3}
              placeholder="March description"
            />
          </div>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-gray-900 mb-4 patriotic-accent">
              {marchData.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {marchData.description}
            </p>
          </>
        )}
        
        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(marchData.startDate)} - {formatDate(marchData.endDate)}
          </span>
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {getTotalDistance().toFixed(1)} Miles
          </span>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-2xl p-8 mb-12 border border-red-100">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Heart className="h-8 w-8 text-red-600" />
            {canEdit() && (
              <div className="ml-4 flex space-x-2">
                {isEditingMission ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Save Changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Cancel Edit"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditMission}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Content"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {isEditingMission ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedData.missionStatement?.title || getMissionStatement().title}
                onChange={(e) => handleMissionStatementChange('title', e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-2xl"
                placeholder="Mission statement title"
              />
              <textarea
                value={editedData.missionStatement?.subtitle || getMissionStatement().subtitle}
                onChange={(e) => handleMissionStatementChange('subtitle', e.target.value)}
                className="text-lg text-gray-700 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-2xl resize-none"
                rows={2}
                placeholder="Mission statement subtitle"
              />
              <textarea
                value={editedData.missionStatement?.description || getMissionStatement().description}
                onChange={(e) => handleMissionStatementChange('description', e.target.value)}
                className="text-gray-700 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-2xl resize-none"
                rows={3}
                placeholder="Mission statement description"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{getMissionStatement().title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-4">
                {getMissionStatement().subtitle}
              </p>
              <p className="text-gray-700 max-w-2xl mx-auto">
                {getMissionStatement().description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-2xl font-bold text-gray-900">{marchData.days.length} Days</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Navigation className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Miles</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalDistance().toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Marchers</p>
              <p className="text-2xl font-bold text-gray-900">
                {canEdit() ? marchData.marchers.length : (marchData.marchers.length > 0 ? 'Join Us!' : '0')}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Partners</p>
              <p className="text-2xl font-bold text-gray-900">
                {marchData.partnerOrganizations.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-red-100 to-blue-100 p-3 rounded-full">
              <div className="flex items-center space-x-1">
                <Stethoscope className="h-6 w-6 text-red-600" />
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Safety Team</p>
              <div className="flex items-baseline space-x-4 mt-1">
                <div className="flex items-center" title={`${getTotalMedicCount()} Medics`}>
                  <Stethoscope className="h-6 w-6 text-red-600" />
                  <span className="text-2xl font-bold text-gray-900 ml-1.5">{getTotalMedicCount()}</span>
                </div>
                <div className="flex items-center" title={`${getTotalPeacekeeperCount()} Peacekeepers`}>
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900 ml-1.5">{getTotalPeacekeeperCount()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mb-12 border border-blue-100">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            {canEdit() && (
              <div className="ml-4 flex space-x-2">
                {isEditingCallToAction ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Save Changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Cancel Edit"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditCallToAction}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Content"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {isEditingCallToAction ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editedData.callToAction?.title || getCallToAction().title}
                onChange={(e) => handleCallToActionChange('title', e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-2xl"
                placeholder="Call to action title"
              />
              <textarea
                value={editedData.callToAction?.description || getCallToAction().description}
                onChange={(e) => handleCallToActionChange('description', e.target.value)}
                className="text-lg text-gray-700 bg-white border border-gray-300 rounded px-3 py-2 w-full max-w-2xl resize-none"
                rows={3}
                placeholder="Call to action description"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{getCallToAction().title}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                {getCallToAction().description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-4 justify-center">
          {canEdit() && (
            <>
              <Link to="/day-management" className="btn-primary flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Manage Days</span>
              </Link>
              <Link to="/marchers" className="btn-secondary flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Manage Marchers</span>
              </Link>
              <Link to="/organizations" className="btn-secondary flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Manage Partners</span>
              </Link>
              <Link to="/data-management" className="btn-outline flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Data Management</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-8">
        <SummaryStats />
      </div>

      {/* Route Map */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-6 w-6 mr-2" />
          Complete March Route
        </h2>
        <p className="text-gray-600 mb-4">
          {formatDate(marchData.startDate)} to {formatDate(marchData.endDate)} • {marchData.days.length} days • {getTotalDistance().toFixed(1)} miles
        </p>
        {routePoints.length > 0 ? (
          <Map
            center={mapCenter}
            routePoints={routePoints}
            polylinePath={polylinePath}
            height="500px"
            showControls={true}
            onPolylineHover={handlePolylineHover}
            onPolylineClick={handlePolylineClick}
            onPolylineLeave={handlePolylineLeave}
            className="rounded-lg"
          />
        ) : (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No route coordinates available</p>
            <p className="text-sm text-gray-500">
              Add coordinates to your day routes to see the complete march path on the map.
            </p>
          </div>
        )}
      </div>

      {/* Itinerary */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="h-6 w-6 mr-3 text-red-600" />
              March Itinerary
            </h2>
            {canEdit() && (
              <div className="flex space-x-2">
                {isEditingItinerary ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Save Changes"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Cancel Edit"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEditItinerary}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Content"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {isEditingItinerary ? (
            <textarea
              value={editedData.itineraryDescription || getItineraryDescription()}
              onChange={(e) => handleFieldChange('itineraryDescription', e.target.value)}
              className="text-gray-600 bg-white border border-gray-300 rounded px-3 py-2 w-full mt-2 resize-none"
              rows={2}
              placeholder="Itinerary description"
            />
          ) : (
            <p className="text-gray-600 mt-2">{getItineraryDescription()}</p>
          )}
        </div>
        <div className="divide-y divide-gray-200">
          {marchData.days.map((day, index) => {
            const dayNumber = getDayNumber(day.id);
            const isHovered = hoveredDayIndex === index;
            const isClicked = clickedPolyline?.dayIndex === index;
            
            return (
              <div 
                key={day.id} 
                ref={(el) => { dayRefs.current[day.id] = el; }}
                className={`p-6 transition-all duration-200 ${
                  isHovered ? 'bg-orange-50 border-l-4 border-orange-500' : 
                  isClicked ? 'bg-blue-50 border-l-4 border-blue-500' :
                  'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-200 ${
                        isHovered ? 'bg-gradient-to-r from-orange-500 to-red-500 scale-110' :
                        isClicked ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110' :
                        'bg-gradient-to-r from-red-600 to-blue-600'
                      }`}>
                        {dayNumber}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Day {dayNumber} - {formatDayDate(day)}
                      </h3>
                      <p className="text-gray-600">
                        {getRoutePointName(day, 'start')} <ArrowRight className="inline h-4 w-4" /> {getRoutePointName(day, 'end')}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {getDayDistance(day).toFixed(1)} miles
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          ~{getDayWalkingTime(day)} hours walking
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {marchData.marchers.filter(m => m.marchingDays?.includes(day.id)).length} marchers
                        </span>
                        {getDayMedicCount(day.id) > 0 && (
                          <span className="flex items-center">
                            <Stethoscope className="h-4 w-4 mr-1 text-red-500" />
                            {getDayMedicCount(day.id)} medic{getDayMedicCount(day.id) !== 1 ? 's' : ''}
                          </span>
                        )}
                        {getDayPeacekeeperCount(day.id) > 0 && (
                          <span className="flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-blue-500" />
                            {getDayPeacekeeperCount(day.id)} peacekeeper{getDayPeacekeeperCount(day.id) !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isClicked && clickedPolyline && (
                        <div className="mt-2 p-2 bg-blue-100 rounded-md text-sm">
                          <p className="font-medium text-blue-800">Route Segment:</p>
                          <p className="text-blue-700">{clickedPolyline.startPoint.name} → {clickedPolyline.endPoint.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/day/${day.id}`}
                    className="btn-primary"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      {canEdit() && (
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Join the Movement?</h3>
            <p className="text-lg mb-6 opacity-90">
              Every step counts. Every voice matters. Join us in this historic march for democracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marchers" className="btn-outline bg-white text-red-600 hover:bg-red-50">
                Join as Marcher
              </Link>
              <Link to="/organizations" className="btn-outline bg-white text-blue-600 hover:bg-blue-50">
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview; 