import { MarchDay } from '@march-organizer/shared';

/**
 * Get readable route point name from a day's route points
 * Falls back to route startPoint/endPoint if no route point found
 */
export const getRoutePointName = (day: MarchDay, pointType: 'start' | 'end'): string => {
  const routePoint = day.route.routePoints.find(point => point.type === pointType);
  if (routePoint && routePoint.name) {
    return routePoint.name;
  }
  // Fallback to the route startPoint/endPoint if no route point found
  return pointType === 'start' ? day.route.startPoint : day.route.endPoint;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Calculate total distance for a day from route points
 */
export const calculateDayDistance = (routePoints: any[]): number => {
  if (!routePoints || routePoints.length < 2) {
    return 0;
  }
  
  let totalDistance = 0;
  for (let i = 0; i < routePoints.length - 1; i++) {
    const point1 = routePoints[i];
    const point2 = routePoints[i + 1];
    
    totalDistance += calculateDistance(
      point1.coordinates.lat, 
      point1.coordinates.lng,
      point2.coordinates.lat, 
      point2.coordinates.lng
    );
  }
  
  return Math.round(totalDistance * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate walking time for a given distance (assuming 3 mph pace)
 */
export const calculateWalkingTime = (distance: number): number => {
  const walkingPace = 3; // miles per hour
  return Math.round((distance / walkingPace) * 10) / 10; // Round to 1 decimal place
}; 