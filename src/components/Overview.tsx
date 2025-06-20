import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { Calendar, MapPin, Users, Building2, Clock, ArrowRight, Flag, Heart, Database, Navigation, Settings, Download, Upload, RotateCcw } from 'lucide-react';
import Map from './Map';
import { RoutePoint } from '../types';

const Overview: React.FC = () => {
  const { marchData, getDayNumber, getTotalDistance } = useMarchData();

  // Create route points for the entire march using actual coordinates
  const { routePoints, mapCenter } = useMemo(() => {
    const allPoints: RoutePoint[] = [];
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    let hasValidCoordinates = false;
    
    marchData.days.forEach((day, index) => {
      // Get start and end points from route points
      const startPoint = day.route.routePoints.find(point => point.type === 'start');
      const endPoint = day.route.routePoints.find(point => point.type === 'end');
      
      // Add start point for each day if it has coordinates
      if (startPoint && startPoint.coordinates.lat !== 0 && startPoint.coordinates.lng !== 0) {
        allPoints.push({
          id: `overview-start-${day.id}`,
          name: day.route.startPoint,
          coordinates: startPoint.coordinates,
          type: index === 0 ? 'start' : 'waypoint',
          description: `Day ${index + 1} Start`,
          estimatedTime: new Date(day.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
        
        // Update bounds
        minLat = Math.min(minLat, startPoint.coordinates.lat);
        maxLat = Math.max(maxLat, startPoint.coordinates.lat);
        minLng = Math.min(minLng, startPoint.coordinates.lng);
        maxLng = Math.max(maxLng, startPoint.coordinates.lng);
        hasValidCoordinates = true;
      }
      
      // Add end point for the last day if it has coordinates
      if (index === marchData.days.length - 1 && endPoint && 
          endPoint.coordinates.lat !== 0 && endPoint.coordinates.lng !== 0) {
        allPoints.push({
          id: `overview-end-${day.id}`,
          name: day.route.endPoint,
          coordinates: endPoint.coordinates,
          type: 'end',
          description: `Day ${index + 1} End`,
          estimatedTime: new Date(day.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        });
        
        // Update bounds
        minLat = Math.min(minLat, endPoint.coordinates.lat);
        maxLat = Math.max(maxLat, endPoint.coordinates.lat);
        minLng = Math.min(minLng, endPoint.coordinates.lng);
        maxLng = Math.max(maxLng, endPoint.coordinates.lng);
        hasValidCoordinates = true;
      }
    });
    
    // Calculate center based on bounds if we have valid coordinates
    let center = marchData.mapSettings?.mapCenter || { lat: 39.8283, lng: -98.5795 };
    if (hasValidCoordinates) {
      center = {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
      };
    }
    
    return { routePoints: allPoints, mapCenter: center };
  }, [marchData.days, marchData.mapSettings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-red-600 to-blue-600 p-3 rounded-full">
            <Flag className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 patriotic-accent">
          {marchData.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {marchData.description}
        </p>
        <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(marchData.startDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            })} - {new Date(marchData.endDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {getTotalDistance()} Miles
          </span>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-2xl p-8 mb-12 border border-red-100">
        <div className="text-center">
          <Heart className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">More than a march—a people's movement</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Join us as we walk together, strengthening community bonds and demonstrating our commitment to democracy. 
            Every step counts, every voice matters.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-center">
                <Navigation className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{getTotalDistance()}</p>
                  <p className="text-sm text-gray-600">Total Miles</p>
                </div>
              </div>
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
              <p className="text-2xl font-bold text-gray-900">{marchData.marchers.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">{marchData.partnerOrganizations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-4 justify-center">
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
        </div>
      </div>

      {/* Route Map */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="h-6 w-6 mr-2" />
          Complete March Route
        </h2>
        <p className="text-gray-600 mb-4">
          {marchData.startDate} to {marchData.endDate} • {marchData.days.length} days • {getTotalDistance()} miles
        </p>
        {routePoints.length > 0 ? (
          <Map
            center={mapCenter}
            routePoints={routePoints}
            height="500px"
            showControls={true}
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <MapPin className="h-6 w-6 mr-3 text-red-600" />
            March Itinerary
          </h2>
          <p className="text-gray-600 mt-2">Join us for an hour, a day, a week, or the whole way</p>
        </div>
        <div className="divide-y divide-gray-200">
          {marchData.days.map((day, index) => {
            const dayNumber = getDayNumber(day.id);
            return (
              <div key={day.id} className="p-6 hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                        {dayNumber}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Day {dayNumber} - {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <p className="text-gray-600">
                        {day.route.startPoint} <ArrowRight className="inline h-4 w-4" /> {day.route.endPoint}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {day.route.distance} miles
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          ~{day.route.estimatedDuration} hours
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {marchData.marchers.filter(m => m.marchingDays?.includes(day.id)).length} marchers
                        </span>
                      </div>
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
    </div>
  );
};

export default Overview; 