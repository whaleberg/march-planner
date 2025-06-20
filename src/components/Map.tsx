import React, { useEffect, useRef, useState } from 'react';
import { MapCoordinates, RoutePoint } from '../types';
import { initializeGoogleMaps, createMap, addRouteToMap, fitMapToBounds } from '../services/mapsService';
import { Loader, MapPin } from 'lucide-react';

interface MapProps {
  center: MapCoordinates;
  zoom?: number;
  routePoints?: RoutePoint[];
  polylinePath?: string;
  height?: string;
  showControls?: boolean;
  onMapClick?: (coordinates: MapCoordinates) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center,
  zoom = 12,
  routePoints = [],
  polylinePath,
  height = '400px',
  showControls = false,
  onMapClick,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const google = await initializeGoogleMaps();
        const newMap = createMap(mapRef.current, center, zoom);
        setMap(newMap);

        // Add click listener if provided
        if (onMapClick) {
          newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              onMapClick({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
              });
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load map');
        setIsLoading(false);
        console.error('Map loading error:', err);
      }
    };

    loadMap();
  }, [center.lat, center.lng, zoom, onMapClick]);

  useEffect(() => {
    if (!map || routePoints.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    // Add new route and markers
    const newMarkers = addRouteToMap(map, routePoints, polylinePath);
    setMarkers(newMarkers);

    // Fit map to show all route points
    fitMapToBounds(map, routePoints);
  }, [map, routePoints, polylinePath]);

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p>Failed to load map</p>
          <p className="text-sm">Please check your internet connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center text-gray-500">
            <Loader className="h-8 w-8 mx-auto mb-2 animate-spin" />
            <p>Loading map...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="w-full rounded-lg"
        style={{ height }}
      />
      
      {showControls && map && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-md p-2 z-20">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => map.setZoom((map.getZoom() || 12) + 1)}
              className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => map.setZoom((map.getZoom() || 12) - 1)}
              className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
              title="Zoom out"
            >
              −
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map; 