import React, { useState, useEffect } from 'react';
import { RoutePoint, MapCoordinates, DayRoute } from '../types';
import { geocodeAddress, calculateRoute } from '../services/mapsService';
import Map from './Map';
import { Plus, Edit, Trash2, Save, X, MapPin, Clock, Navigation, ChevronDown } from 'lucide-react';

interface RouteEditorProps {
  route: DayRoute;
  onRouteUpdate: (updatedRoute: DayRoute) => void;
  isEditing?: boolean;
}

const RouteEditor: React.FC<RouteEditorProps> = ({ route, onRouteUpdate, isEditing = false }) => {
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

  // Initialize route points if empty
  useEffect(() => {
    if (routePoints.length === 0 && route.startPoint && route.endPoint) {
      const initializePoints = async () => {
        const startCoords = await geocodeAddress(route.startPoint);
        const endCoords = await geocodeAddress(route.endPoint);
        
        if (startCoords && endCoords) {
          const points: RoutePoint[] = [
            {
              id: 'start',
              name: route.startPoint,
              coordinates: startCoords,
              type: 'start'
            },
            {
              id: 'end',
              name: route.endPoint,
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
    if (!newPoint.name) return;

    setIsCalculating(true);
    const coordinates = await geocodeAddress(newPoint.name);
    
    if (coordinates) {
      const point: RoutePoint = {
        id: `point-${Date.now()}`,
        name: newPoint.name,
        coordinates,
        type: newPoint.type || 'waypoint',
        description: newPoint.description || '',
        estimatedTime: newPoint.estimatedTime || '',
        notes: newPoint.notes || ''
      };

      // Insert at the specified position
      const updatedPoints = [...routePoints];
      updatedPoints.splice(insertPosition, 0, point);
      setRoutePoints(updatedPoints);
      
      // Recalculate route
      const routeResult = await calculateRoute(updatedPoints);
      if (routeResult) {
        onRouteUpdate({
          ...route,
          routePoints: updatedPoints,
          distance: routeResult.distance,
          estimatedDuration: routeResult.duration,
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
    }
    setIsCalculating(false);
  };

  const handleEditPoint = (point: RoutePoint) => {
    setEditingPoint(point);
  };

  const handleSavePoint = async () => {
    if (!editingPoint) return;

    setIsCalculating(true);
    
    // Read form values
    const name = (document.getElementById(`event-title-${editingPoint.id}`) as HTMLInputElement)?.value || editingPoint.name;
    const type = (document.getElementById(`event-type-${editingPoint.id}`) as HTMLSelectElement)?.value as RoutePoint['type'] || editingPoint.type;
    const estimatedTime = (document.getElementById(`event-time-${editingPoint.id}`) as HTMLInputElement)?.value || editingPoint.estimatedTime;
    const description = (document.getElementById(`event-description-${editingPoint.id}`) as HTMLInputElement)?.value || editingPoint.description;
    
    const coordinates = await geocodeAddress(name);
    
    if (coordinates) {
      const updatedPoint = { 
        ...editingPoint, 
        name,
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
      if (routeResult) {
        onRouteUpdate({
          ...route,
          routePoints: updatedPoints,
          distance: routeResult.distance,
          estimatedDuration: routeResult.duration,
          polylinePath: routeResult.polylinePath
        });
      }
    }
    
    setEditingPoint(null);
    setIsCalculating(false);
  };

  const handleDeletePoint = async (pointId: string) => {
    const updatedPoints = routePoints.filter(p => p.id !== pointId);
    setRoutePoints(updatedPoints);
    
    // Recalculate route
    const routeResult = await calculateRoute(updatedPoints);
    if (routeResult) {
      onRouteUpdate({
        ...route,
        routePoints: updatedPoints,
        distance: routeResult.distance,
        estimatedDuration: routeResult.duration,
        polylinePath: routeResult.polylinePath
      });
    }
  };

  const handleMapClick = async (coordinates: MapCoordinates) => {
    if (!isEditing) return;

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        setNewPoint(prev => ({ ...prev, name: address }));
      }
    });
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

  return (
    <div className="space-y-6">
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
          {isEditing && (
            <div className="text-sm text-gray-600">
              Distance: {route.distance} miles | Duration: {route.estimatedDuration} hours
            </div>
          )}
        </div>

        {/* Add New Point Form */}
        {isEditing && (
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
                <label className="block text-sm font-medium text-gray-700">Name/Address</label>
                <input
                  type="text"
                  value={newPoint.name}
                  onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter address or location name"
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
                  disabled={!newPoint.name || isCalculating}
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
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        id={`event-title-${point.id}`}
                        type="text"
                        defaultValue={editingPoint.name}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
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
                    {isEditing && (
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