import React, { useState, useEffect } from 'react';
import { RoutePoint, MapCoordinates, Route, MarchDay } from '../types';
import { geocodeAddress, calculateRoute, initializeGoogleMaps } from '../services/mapsService';
import Map from './Map';
import { Plus, Edit, Trash2, Save, X, MapPin, Clock, Navigation, ChevronDown } from 'lucide-react';
import LocationPreview from './LocationPreview';
import { useMarchData } from '../context/MarchContext';

interface RouteEditorProps {
  route: Route;
  onRouteUpdate: (updatedRoute: Route) => void;
  ready?: boolean;
}

const RouteEditor: React.FC<RouteEditorProps> = ({ route, onRouteUpdate, ready = true }) => {
  const { getDayDistance, getDayWalkingTime } = useMarchData();
  const [isRouteEditing, setIsRouteEditing] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(route.routePoints || []);
  const [editingPoint, setEditingPoint] = useState<RoutePoint | null>(null);
  const [newPoint, setNewPoint] = useState<Partial<RoutePoint>>({
    name: '',
    type: 'waypoint',
    description: '',
    estimatedTime: '',
    notes: ''
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCoordinates>({ lat: 39.8283, lng: -98.5795 }); // Center of US
  const [showInsertOptions, setShowInsertOptions] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number>(0);
  const [showLocationPreview, setShowLocationPreview] = useState(false);
  const [previewAddress, setPreviewAddress] = useState('');
  const [editingPointName, setEditingPointName] = useState('');
  const [showEditLocationPreview, setShowEditLocationPreview] = useState(false);
  const [editPreviewAddress, setEditPreviewAddress] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create a temporary day object for computing distance and time
  const tempDay: MarchDay = {
    id: 'temp',
    date: '',
    route: { ...route, routePoints },
    breakfast: { time: '', location: '', description: '' },
    lunch: { time: '', location: '', description: '' },
    dinner: { time: '', location: '', description: '' },
    specialEvents: [],
    marchers: [],
    partnerOrganizations: [],
    vehicleSchedules: []
  };

  const computedDistance = getDayDistance(tempDay);
  const computedWalkingTime = getDayWalkingTime(tempDay);

  // Sync routePoints with route prop when it changes
  useEffect(() => {
    setRoutePoints(route.routePoints || []);
  }, [route]);

  // Auto-populate start/end points from route points
  useEffect(() => {
    if (!ready) return; // Don't update until ready
    
    if (routePoints.length > 0) {
      const startPoint = routePoints.find(p => p.type === 'start');
      const endPoint = routePoints.find(p => p.type === 'end');
      
      if (startPoint && startPoint.address !== route.startPoint) {
        onRouteUpdate({
          ...route,
          startPoint: startPoint.address || startPoint.name
        });
      }
      
      if (endPoint && endPoint.address !== route.endPoint) {
        onRouteUpdate({
          ...route,
          endPoint: endPoint.address || endPoint.name
        });
      }
    }
  }, [routePoints, route.startPoint, route.endPoint, onRouteUpdate, ready]);

  // Initialize route points if empty
  useEffect(() => {
    if (routePoints.length === 0 && route.startPoint && route.endPoint) {
      const initializePoints = async () => {
        const startCoords = await geocodeAddress(route.startPoint);
        const endCoords = await geocodeAddress(route.endPoint);
        
        if (startCoords && endCoords) {
          const timestamp = Date.now();
          const points: RoutePoint[] = [
            {
              id: `start-${timestamp}`,
              name: route.startPoint, // Use as display name
              address: route.startPoint, // Use as full address
              coordinates: startCoords,
              type: 'start'
            },
            {
              id: `end-${timestamp}`,
              name: route.endPoint, // Use as display name
              address: route.endPoint, // Use as full address
              coordinates: endCoords,
              type: 'end'
            }
          ];
          setRoutePoints(points);
          setMapCenter(startCoords);
        }
      };
      initializePoints();
    }
  }, [route.startPoint, route.endPoint]);

  const handleAddPoint = async () => {
    if (!previewAddress) return;
    setPreviewAddress(previewAddress);
    setShowLocationPreview(true);
  };

  const handleEditPoint = (point: RoutePoint) => {
    setEditingPoint(point);
  };

  const handleSavePoint = async () => {
    if (!editingPoint || !ready) return;
    const name = editingPointName || (document.getElementById(`event-title-${editingPoint.id}`) as HTMLInputElement)?.value || editingPoint.name;
    const address = editPreviewAddress || editingPoint.address || editingPoint.name;
    const type = (document.getElementById(`event-type-${editingPoint.id}`) as HTMLSelectElement)?.value as RoutePoint['type'] || editingPoint.type;
    const estimatedTime = (document.getElementById(`event-time-${editingPoint.id}`) as HTMLInputElement)?.value || editingPoint.estimatedTime;
    const description = (document.getElementById(`event-description-${editingPoint.id}`) as HTMLInputElement)?.value || editingPoint.description;
    
    // If name or address changed, trigger geocoding
    if (name !== editingPoint.name || address !== (editingPoint.address || editingPoint.name)) {
      setEditPreviewAddress(address);
      setShowEditLocationPreview(true);
      setNewPoint({
        name,
        type,
        estimatedTime,
        description,
        notes: editingPoint.notes || ''
      });
      return;
    }
    
    setIsCalculating(true);
    
    const coordinates = await geocodeAddress(address);
    
    if (coordinates) {
      const updatedPoint = { 
        ...editingPoint, 
        name,
        address,
        type,
        coordinates,
        estimatedTime,
        description
      };
      const updatedPoints = routePoints.map(p => 
        p.id === editingPoint.id ? updatedPoint : p
      );
      
      setRoutePoints(updatedPoints);
      
      // Recalculate route
      const routeResult = await calculateRoute(updatedPoints);
      if (routeResult && ready) {
        onRouteUpdate({
          ...route,
          routePoints: updatedPoints,
          polylinePath: routeResult.polylinePath
        });
      }
    }
    
    setEditingPoint(null);
    setIsCalculating(false);
  };

  const handleDeletePoint = async (pointId: string) => {
    if (!ready) return;
    
    const updatedPoints = routePoints.filter(p => p.id !== pointId);
    setRoutePoints(updatedPoints);
    
    // Recalculate route
    const routeResult = await calculateRoute(updatedPoints);
    if (routeResult) {
      onRouteUpdate({
        ...route,
        routePoints: updatedPoints,
        polylinePath: routeResult.polylinePath
      });
    }
  };

  const handleMapClick = async (coordinates: MapCoordinates) => {
    if (!isRouteEditing) return;

    try {
      // Initialize Google Maps before using geocoder
      const google = await initializeGoogleMaps();
      
      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      const latlng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setPreviewAddress(address);
        }
      });
    } catch (error) {
      console.error('Error initializing Google Maps for geocoding:', error);
    }
  };

  const getInsertContext = (position: number) => {
    if (routePoints.length === 0) return "No existing points";
    
    if (position === 0) {
      return "Insert at the beginning of the route";
    }
    
    if (position >= routePoints.length) {
      const lastPoint = routePoints[routePoints.length - 1];
      return `Insert after: ${lastPoint.name}`;
    }
    
    const beforePoint = routePoints[position - 1];
    const afterPoint = routePoints[position];
    return `Insert between: ${beforePoint.name} → ${afterPoint.name}`;
  };

  const getInsertOptions = () => {
    const options = [];
    
    // Option to insert at the beginning
    options.push({
      value: 0,
      label: "At the beginning",
      context: routePoints.length > 0 ? `Before: ${routePoints[0].name}` : "Start of route"
    });
    
    // Options to insert between existing points
    for (let i = 1; i <= routePoints.length; i++) {
      const beforePoint = routePoints[i - 1];
      const afterPoint = routePoints[i];
      
      if (afterPoint) {
        options.push({
          value: i,
          label: `Between ${beforePoint.name} and ${afterPoint.name}`,
          context: `${beforePoint.name} → ${afterPoint.name}`
        });
      } else {
        options.push({
          value: i,
          label: `After ${beforePoint.name}`,
          context: `After: ${beforePoint.name}`
        });
      }
    }
    
    return options;
  };

  const handleLocationSelect = async (coordinates: MapCoordinates, formattedAddress: string) => {
    if (!ready) return;
    
    setIsCalculating(true);
    if (showEditLocationPreview && editingPoint) {
      // Editing an existing point
      const updatedPoint = {
        ...editingPoint,
        name: newPoint.name || formattedAddress, // Use custom name or fallback to address
        address: formattedAddress, // Always use the full formatted address
        coordinates,
        type: newPoint.type || editingPoint.type,
        estimatedTime: newPoint.estimatedTime || editingPoint.estimatedTime,
        description: newPoint.description || editingPoint.description
      };
      const updatedPoints = routePoints.map(p =>
        p.id === editingPoint.id ? updatedPoint : p
      );
      setRoutePoints(updatedPoints);
      const routeResult = await calculateRoute(updatedPoints);
      if (routeResult) {
        onRouteUpdate({
          ...route,
          routePoints: updatedPoints,
          polylinePath: routeResult.polylinePath
        });
      }
      setEditingPoint(null);
      setEditingPointName('');
      setShowEditLocationPreview(false);
      setEditPreviewAddress('');
    } else {
      // Adding a new point
      const point: RoutePoint = {
        id: `point-${Date.now()}`,
        name: newPoint.name || formattedAddress, // Use custom name or fallback to address
        address: formattedAddress, // Always use the full formatted address
        coordinates,
        type: newPoint.type || 'waypoint',
        description: newPoint.description || '',
        estimatedTime: newPoint.estimatedTime || '',
        notes: newPoint.notes || ''
      };
      const updatedPoints = [...routePoints];
      updatedPoints.splice(insertPosition, 0, point);
      setRoutePoints(updatedPoints);
      const routeResult = await calculateRoute(updatedPoints);
      if (routeResult) {
        onRouteUpdate({
          ...route,
          routePoints: updatedPoints,
          polylinePath: routeResult.polylinePath
        });
      }
      setNewPoint({
        name: '',
        type: 'waypoint',
        description: '',
        estimatedTime: '',
        notes: ''
      });
      setShowInsertOptions(false);
      setShowLocationPreview(false);
      setPreviewAddress('');
    }
    setIsCalculating(false);
  };

  const handleLocationPreviewCancel = () => {
    setShowLocationPreview(false);
    setPreviewAddress('');
    setShowEditLocationPreview(false);
    setEditPreviewAddress('');
  };

  const handleRegeolocateAllPoints = async () => {
    if (!ready || routePoints.length === 0) return;
    
    setIsCalculating(true);
    
    try {
      const updatedPoints: RoutePoint[] = [];
      
      for (const point of routePoints) {
        const address = point.address || point.name;
        if (address) {
          const coordinates = await geocodeAddress(address);
          if (coordinates) {
            updatedPoints.push({
              ...point,
              coordinates
            });
          } else {
            // Keep original coordinates if geocoding fails
            updatedPoints.push(point);
          }
        } else {
          // Keep point as is if no address
          updatedPoints.push(point);
        }
      }
      
      setRoutePoints(updatedPoints);
      
      // Recalculate route with updated coordinates
      const routeResult = await calculateRoute(updatedPoints);
      if (routeResult) {
        onRouteUpdate({
          ...route,
          routePoints: updatedPoints,
          polylinePath: routeResult.polylinePath
        });
      }
      
      // Show success message
      setNotification({ type: 'success', message: `Successfully re-geolocated ${updatedPoints.length} route points with more accurate coordinates.` });
      
    } catch (error) {
      console.error('Error re-geolocating points:', error);
      setNotification({ type: 'error', message: 'Error re-geolocating points. Please try again.' });
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-md ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Map Display */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Route Map
        </h3>
        <Map
          center={mapCenter}
          routePoints={routePoints}
          polylinePath={route.polylinePath}
          height="400px"
          showControls={true}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Route Points Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Route Points
          </h3>
          <div className="flex items-center space-x-2">
            {isRouteEditing && (
              <div className="text-sm text-gray-600 mr-4">
                Distance: {computedDistance.toFixed(1)} miles | Walking Time: {computedWalkingTime} hours
              </div>
            )}
            {isRouteEditing ? (
              <>
                <button
                  onClick={handleRegeolocateAllPoints}
                  disabled={isCalculating || routePoints.length === 0}
                  className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
                  title="Re-geolocate all route points with more accurate coordinates"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{isCalculating ? 'Geolocating...' : 'Re-geolocate All'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsRouteEditing(false);
                    setEditingPoint(null);
                    setNewPoint({
                      name: '',
                      type: 'waypoint',
                      description: '',
                      estimatedTime: '',
                      notes: ''
                    });
                    setPreviewAddress('');
                    setShowInsertOptions(false);
                  }}
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 text-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Route</span>
                </button>
                <button
                  onClick={() => {
                    setIsRouteEditing(false);
                    setEditingPoint(null);
                    setRoutePoints(route.routePoints || []);
                    setNewPoint({
                      name: '',
                      type: 'waypoint',
                      description: '',
                      estimatedTime: '',
                      notes: ''
                    });
                    setPreviewAddress('');
                    setShowInsertOptions(false);
                  }}
                  className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2 text-sm"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsRouteEditing(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 text-sm"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Route</span>
              </button>
            )}
          </div>
        </div>

        {/* Add New Point Form */}
        {isRouteEditing && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Add New Point</h4>
            
            {/* Insert Position Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Insert Position</label>
              <div className="relative">
                <button
                  onClick={() => setShowInsertOptions(!showInsertOptions)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-900">
                    {getInsertContext(insertPosition)}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showInsertOptions ? 'rotate-180' : ''}`} />
                </button>
                
                {showInsertOptions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {getInsertOptions().map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setInsertPosition(option.value);
                          setShowInsertOptions(false);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="font-medium text-sm text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.context}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  value={newPoint.name}
                  onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Short name (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={previewAddress}
                  onChange={(e) => setPreviewAddress(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newPoint.type}
                  onChange={(e) => setNewPoint({ ...newPoint, type: e.target.value as RoutePoint['type'] })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="waypoint">Waypoint</option>
                  <option value="stop">Stop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ETA</label>
                <input
                  type="text"
                  value={newPoint.estimatedTime}
                  onChange={(e) => setNewPoint({ ...newPoint, estimatedTime: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g., 2:30 PM"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddPoint}
                  disabled={!previewAddress || isCalculating}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-1 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Point</span>
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={newPoint.description}
                onChange={(e) => setNewPoint({ ...newPoint, description: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Optional description"
              />
            </div>
          </div>
        )}

        {/* Route Points List */}
        <div className="space-y-3">
          {routePoints.map((point, index) => (
            <div key={point.id} className="border border-gray-200 rounded-lg p-4">
              {editingPoint?.id === point.id ? (
                // Edit mode
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Display Name</label>
                        <input
                          id={`event-title-${point.id}`}
                          type="text"
                          defaultValue={editingPoint.name}
                          onChange={(e) => setEditingPointName(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Short name"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          value={editPreviewAddress || editingPoint.address || editingPoint.name}
                          onChange={(e) => setEditPreviewAddress(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          placeholder="Full address"
                        />
                        {editingPoint && editingPoint.id === point.id && (
                          <LocationPreview
                            address={editPreviewAddress || editingPoint.address || editingPoint.name || ''}
                            onLocationSelect={handleLocationSelect}
                            onCancel={handleLocationPreviewCancel}
                            isVisible={showEditLocationPreview && editingPoint.id === point.id}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        id={`event-type-${point.id}`}
                        defaultValue={editingPoint.type}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="start">Start</option>
                        <option value="waypoint">Waypoint</option>
                        <option value="stop">Stop</option>
                        <option value="end">End</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ETA</label>
                      <input
                        id={`event-time-${point.id}`}
                        type="text"
                        defaultValue={editingPoint.estimatedTime}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSavePoint}
                        className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm flex items-center space-x-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setEditingPoint(null)}
                        className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      id={`event-description-${point.id}`}
                      type="text"
                      defaultValue={editingPoint.description}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{point.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(point.type)}`}>
                          {point.type}
                        </span>
                        <span className="text-sm text-gray-500">#{index + 1}</span>
                      </div>
                      {point.address && point.address !== point.name && (
                        <p className="text-sm text-gray-600 mt-1">{point.address}</p>
                      )}
                      {point.description && (
                        <p className="text-sm text-gray-600 mt-1">{point.description}</p>
                      )}
                      {point.estimatedTime && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          ETA: {point.estimatedTime}
                        </p>
                      )}
                      {point.notes && (
                        <p className="text-xs text-gray-500 mt-1">{point.notes}</p>
                      )}
                    </div>
                    {isRouteEditing && (
                      <div className="flex space-x-1 ml-4">
                        <button
                          onClick={() => handleEditPoint(point)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit point"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {point.type !== 'start' && point.type !== 'end' && (
                          <button
                            onClick={() => handleDeletePoint(point.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete point"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <LocationPreview
        address={previewAddress}
        onLocationSelect={handleLocationSelect}
        onCancel={handleLocationPreviewCancel}
        isVisible={showLocationPreview}
      />
    </div>
  );
};

const getTypeColor = (type: RoutePoint['type']): string => {
  switch (type) {
    case 'start':
      return 'bg-green-100 text-green-800';
    case 'end':
      return 'bg-red-100 text-red-800';
    case 'waypoint':
      return 'bg-blue-100 text-blue-800';
    case 'stop':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default RouteEditor; 