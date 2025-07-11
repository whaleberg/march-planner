import React from 'react';
import { trpc } from '../lib/trpc';
import { Users, Stethoscope, Shield, Calendar, Building2, Truck } from 'lucide-react';
import { useMarches } from '../hooks/useMarchData';

const SummaryStats: React.FC = () => {
  // Get all marches first to get the marchId
  const { data: marchesData, isLoading: marchesLoading } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // Fetch summary data using tRPC
  const { data: marchersSummary, isLoading: marchersLoading, error: marchersError } = trpc.summary.marchers.useQuery(
    { marchId: marchId || '' },
    { enabled: !!marchId }
  );
  const { data: marchersByDay, isLoading: daysLoading, error: daysError } = trpc.summary.marchersByDay.useQuery(
    { marchId: marchId || '' },
    { enabled: !!marchId }
  );
  const { data: daysSummary, isLoading: daysSummaryLoading, error: daysSummaryError } = trpc.summary.days.useQuery(
    { marchId: marchId || '' },
    { enabled: !!marchId }
  );
  const { data: partnersSummary, isLoading: partnersLoading, error: partnersError } = trpc.summary.partners.useQuery(
    { marchId: marchId || '' },
    { enabled: !!marchId }
  );
  const { data: vehiclesSummary, isLoading: vehiclesLoading, error: vehiclesError } = trpc.summary.vehicles.useQuery(
    { marchId: marchId || '' },
    { enabled: !!marchId }
  );

  if (marchesLoading || marchersLoading || daysLoading || daysSummaryLoading || partnersLoading || vehiclesLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (marchersError || daysError || daysSummaryError || partnersError || vehiclesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading statistics
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {marchersError?.message || daysError?.message || daysSummaryError?.message || partnersError?.message || vehiclesError?.message || 'Failed to load summary data'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Overall March Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">Total Marchers</p>
                <p className="text-2xl font-bold text-blue-900">{marchersSummary?.total || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Medics</p>
                <p className="text-2xl font-bold text-green-900">{marchersSummary?.medics || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-600">Peacekeepers</p>
                <p className="text-2xl font-bold text-purple-900">{marchersSummary?.peacekeepers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-600">Total Days</p>
                <p className="text-2xl font-bold text-orange-900">{daysSummary?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-indigo-600">Partner Organizations</p>
                <p className="text-2xl font-bold text-indigo-900">{partnersSummary?.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 rounded-lg p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-teal-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-teal-600">Support Vehicles</p>
                <p className="text-2xl font-bold text-teal-900">{vehiclesSummary?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Daily Marcher Statistics
        </h2>
        
        {marchersByDay && marchersByDay.length > 0 ? (
          <div className="space-y-4">
            {marchersByDay.map((day) => (
              <div key={day.dayId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <span className="text-sm text-gray-500">Day {day.dayId}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <span className="text-sm text-gray-600">Total:</span>
                    <span className="font-semibold text-gray-900">{day.total}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-green-50 rounded px-3 py-2">
                    <span className="text-sm text-green-600">Medics:</span>
                    <span className="font-semibold text-green-900">{day.medics}</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-purple-50 rounded px-3 py-2">
                    <span className="text-sm text-purple-600">Peacekeepers:</span>
                    <span className="font-semibold text-purple-900">{day.peacekeepers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No daily statistics available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryStats; 