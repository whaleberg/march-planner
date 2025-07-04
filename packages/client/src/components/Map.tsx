import React, { useEffect, useRef, useState } from 'react';
import { MapCoordinates, RoutePoint } from '../types';
import { createMap, addRouteToMap, fitMapToBounds, initializeGoogleMaps } from '../services/mapsService';
import { Loader, MapPin } from 'lucide-react';

interface MapProps {
  center: MapCoordinates;
  zoom?: number;
  routePoints?: RoutePoint[];
  polylinePath?: string;
  height?: string;
  showControls?: boolean;
  onMapClick?: (coordinates: MapCoordinates) => void;
  onPolylineHover?: (startPoint: RoutePoint, endPoint: RoutePoint, dayIndex: number) => void;
  onPolylineClick?: (startPoint: RoutePoint, endPoint: RoutePoint, dayIndex: number) => void;
  onPolylineLeave?: () => void;
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
  onPolylineHover,
  onPolylineClick,
  onPolylineLeave,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current) {
        console.warn('Map: mapRef.current is null, skipping map creation');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Remove 'const google = ...' if not used
        
        // Double-check that the ref still exists after async operations
        if (!mapRef.current) {
          console.warn('Map: mapRef.current became null after async operations');
          setIsLoading(false);
          return;
        }
        
        const newMap = await createMap(mapRef.current, center, zoom);
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
        console.error('Map loading error:', err);
        if (err instanceof Error) {
          if (err.message.includes('API key is missing')) {
            setError('Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
          } else if (err.message.includes('Invalid Google Maps API key')) {
            setError('Invalid Google Maps API key. Please check your VITE_GOOGLE_MAPS_API_KEY in the .env file.');
          } else {
            setError('Failed to load map. Please check your internet connection and Google Maps API key.');
          }
        } else {
          setError('Failed to load map');
        }
        setIsLoading(false);
      }
    };

    loadMap();
  }, [center.lat, center.lng, zoom, onMapClick]);

  useEffect(() => {
    if (!map || routePoints.length === 0) return;

    const updateMap = async () => {
      // Clear existing markers and polylines
      markers.forEach(marker => marker.setMap(null));
      polylines.forEach(polyline => polyline.setMap(null));
      
      // Add new route and markers
      const newMarkers = await addRouteToMap(map, routePoints, polylinePath);
      setMarkers(newMarkers);

      // Create interactive polylines if we have polyline interaction handlers
      if (onPolylineHover || onPolylineClick) {
        const newPolylines: google.maps.Polyline[] = [];
        
        // Ensure Google Maps is loaded before creating polylines
        const initializePolylines = async () => {
          try {
            const google = await initializeGoogleMaps();
            
            // Create polylines between consecutive points
            for (let i = 0; i < routePoints.length - 1; i++) {
              const startPoint = routePoints[i];
              const endPoint = routePoints[i + 1];
              
              const polyline = new google.maps.Polyline({
                path: [
                  { lat: startPoint.coordinates.lat, lng: startPoint.coordinates.lng },
                  { lat: endPoint.coordinates.lat, lng: endPoint.coordinates.lng }
                ],
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 0.7,
                strokeWeight: 4,
                map
              });

              // Add hover events
              if (onPolylineHover) {
                polyline.addListener('mouseover', () => {
                  polyline.setOptions({
                    strokeColor: '#FF6B35',
                    strokeOpacity: 1.0,
                    strokeWeight: 6
                  });
                  onPolylineHover(startPoint, endPoint, i);
                });
              }

              if (onPolylineLeave) {
                polyline.addListener('mouseout', () => {
                  polyline.setOptions({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.7,
                    strokeWeight: 4
                  });
                  onPolylineLeave();
                });
              }

              // Add click events
              if (onPolylineClick) {
                polyline.addListener('click', () => {
                  onPolylineClick(startPoint, endPoint, i);
                });
              }

              newPolylines.push(polyline);
            }
            
            setPolylines(newPolylines);
          } catch (error) {
            console.error('Error creating polylines:', error);
          }
        };
        
        initializePolylines();
      }

      // Fit map to show all route points
      await fitMapToBounds(map, routePoints);
    };

    updateMap();
  }, [map, routePoints, polylinePath, onPolylineHover, onPolylineClick, onPolylineLeave]);

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