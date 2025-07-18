import { RoutePoint, MarchDay } from '../types';

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate total distance for a route
export const getDayDistance = (day: MarchDay): number => {
  const routePoints = day.route.routePoints || [];
  if (routePoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const point1 = routePoints[i];
    const point2 = routePoints[i + 1];
    
    if (point1.coordinates && point2.coordinates) {
      totalDistance += calculateDistance(
        point1.coordinates.lat,
        point1.coordinates.lng,
        point2.coordinates.lat,
        point2.coordinates.lng
      );
    }
  }
  
  return totalDistance;
};

// Calculate walking time (assuming 3 mph average walking speed)
export const getDayWalkingTime = (day: MarchDay): number => {
  const distance = getDayDistance(day);
  const walkingSpeed = 3; // miles per hour
  return distance / walkingSpeed;
};

// Calculate distance for a specific route
export const getRouteDistance = (routePoints: RoutePoint[]): number => {
  if (routePoints.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const point1 = routePoints[i];
    const point2 = routePoints[i + 1];
    
    if (point1.coordinates && point2.coordinates) {
      totalDistance += calculateDistance(
        point1.coordinates.lat,
        point1.coordinates.lng,
        point2.coordinates.lat,
        point2.coordinates.lng
      );
    }
  }
  
  return totalDistance;
};

// Calculate walking time for a specific route
export const getRouteWalkingTime = (routePoints: RoutePoint[]): number => {
  const distance = getRouteDistance(routePoints);
  const walkingSpeed = 3; // miles per hour
  return distance / walkingSpeed;
}; 