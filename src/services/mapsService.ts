import { Loader } from '@googlemaps/js-api-loader';
import { MapCoordinates, RoutePoint } from '../types';

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsLoaded = false;
let loader: Loader | null = null;

export const initializeGoogleMaps = async (): Promise<typeof google> => {
  if (googleMapsLoaded && window.google) {
    return window.google;
  }

  if (!loader) {
    loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  try {
    const google = await loader.load();
    googleMapsLoaded = true;
    return google;
  } catch (error) {
    console.error('Failed to load Google Maps API:', error);
    throw error;
  }
};

export const geocodeAddress = async (address: string): Promise<MapCoordinates | null> => {
  try {
    const google = await initializeGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const geocodeAddressMultiple = async (address: string): Promise<Array<{
  coordinates: MapCoordinates;
  formattedAddress: string;
  placeId: string;
}> | null> => {
  try {
    const google = await initializeGoogleMaps();
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const locations = results.slice(0, 5).map(result => ({
            coordinates: {
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng()
            },
            formattedAddress: result.formatted_address,
            placeId: result.place_id
          }));
          resolve(locations);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const calculateRoute = async (
  waypoints: RoutePoint[]
): Promise<{
  distance: number;
  duration: number;
  polylinePath: string;
  routePoints: RoutePoint[];
} | null> => {
  try {
    const google = await initializeGoogleMaps();
    const directionsService = new google.maps.DirectionsService();
    
    if (waypoints.length < 2) {
      return null;
    }

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const waypointsForService = waypoints.slice(1, -1).map(point => ({
      location: new google.maps.LatLng(point.coordinates.lat, point.coordinates.lng),
      stopover: true
    }));

    return new Promise((resolve) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.coordinates.lat, origin.coordinates.lng),
          destination: new google.maps.LatLng(destination.coordinates.lat, destination.coordinates.lng),
          waypoints: waypointsForService,
          optimizeWaypoints: false,
          travelMode: google.maps.TravelMode.WALKING
        },
        (result, status) => {
          if (status === 'OK' && result && result.routes[0]) {
            const route = result.routes[0];
            const leg = route.legs[0];
            
            if (!leg.distance || !leg.duration) {
              resolve(null);
              return;
            }
            
            // Convert distance from meters to miles
            const distanceInMiles = leg.distance.value * 0.000621371;
            // Convert duration from seconds to hours
            const durationInHours = leg.duration.value / 3600;
            
            // Encode the polyline
            const polylinePath = google.maps.geometry.encoding.encodePath(route.overview_path);
            
            resolve({
              distance: Math.round(distanceInMiles * 10) / 10, // Round to 1 decimal place
              duration: Math.round(durationInHours * 10) / 10, // Round to 1 decimal place
              polylinePath: polylinePath || '',
              routePoints: waypoints
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
};

export const createMap = (
  element: HTMLElement,
  center: MapCoordinates,
  zoom: number = 12
): google.maps.Map => {
  return new google.maps.Map(element, {
    center: { lat: center.lat, lng: center.lng },
    zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });
};

export const addRouteToMap = (
  map: google.maps.Map,
  routePoints: RoutePoint[],
  polylinePath?: string
): google.maps.Marker[] => {
  const markers: google.maps.Marker[] = [];
  
  // Add markers for each route point
  routePoints.forEach((point, index) => {
    const marker = new google.maps.Marker({
      position: { lat: point.coordinates.lat, lng: point.coordinates.lng },
      map,
      title: point.name,
      label: {
        text: (index + 1).toString(),
        color: 'white'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: getMarkerColor(point.type),
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2
      }
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${point.name}</h3>
          <p style="margin: 4px 0;"><strong>Type:</strong> ${point.type}</p>
          ${point.description ? `<p style="margin: 4px 0;"><strong>Description:</strong> ${point.description}</p>` : ''}
          ${point.estimatedTime ? `<p style="margin: 4px 0;"><strong>ETA:</strong> ${point.estimatedTime}</p>` : ''}
          ${point.notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${point.notes}</p>` : ''}
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });

  // Add polyline if available
  if (polylinePath) {
    const path = google.maps.geometry.encoding.decodePath(polylinePath);
    new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map
    });
  }

  return markers;
};

const getMarkerColor = (type: RoutePoint['type']): string => {
  switch (type) {
    case 'start':
      return '#4CAF50'; // Green
    case 'end':
      return '#F44336'; // Red
    case 'waypoint':
      return '#2196F3'; // Blue
    case 'stop':
      return '#FF9800'; // Orange
    default:
      return '#9E9E9E'; // Gray
  }
};

export const fitMapToBounds = (
  map: google.maps.Map,
  routePoints: RoutePoint[]
): void => {
  if (routePoints.length === 0) return;

  const bounds = new google.maps.LatLngBounds();
  routePoints.forEach(point => {
    bounds.extend({ lat: point.coordinates.lat, lng: point.coordinates.lng });
  });

  map.fitBounds(bounds);
  
  // Add some padding
  google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
    const currentZoom = map.getZoom();
    if (currentZoom && currentZoom > 15) {
      map.setZoom(15);
    }
  });
}; 