import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { Marcher } from '../types';
import { Calendar, Users, Check, X } from 'lucide-react';

const MarcherSchedule: React.FC = () => {
  const { marchData, updateMarcher, getDayNumber } = useMarchData();
  const [selectedMarcher, setSelectedMarcher] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Handle URL parameter for pre-selecting a marcher
  useEffect(() => {
    const marcherId = searchParams.get('marcher');
    if (marcherId && marchData.marchers.find(m => m.id === marcherId)) {
      setSelectedMarcher(marcherId);
    }
  }, [searchParams, marchData.marchers]);

  const handleDayToggle = (marcherId: string, dayId: string) => {
    const marcher = marchData.marchers.find(m => m.id === marcherId);
    if (!marcher) return;

    const updatedMarcher = { ...marcher };
    const currentDays = updatedMarcher.marchingDays || [];
    
    // Remove any duplicates first
    const uniqueDays = [...new Set(currentDays)];
    const dayIndex = uniqueDays.indexOf(dayId);
    
    console.log('Toggle debug:', {
      marcherId,
      dayId,
      currentDays: uniqueDays,
      dayIndex,
      isCurrentlyScheduled: dayIndex !== -1
    });
    
    if (dayIndex === -1) {
      // Add day to marcher's schedule
      updatedMarcher.marchingDays = [...uniqueDays, dayId];
      console.log('Adding day, new schedule:', updatedMarcher.marchingDays);
    } else {
      // Remove day from marcher's schedule
      updatedMarcher.marchingDays = uniqueDays.filter(id => id !== dayId);
      console.log('Removing day, new schedule:', updatedMarcher.marchingDays);
    }

    updateMarcher(marcherId, updatedMarcher);
  };

  const isMarcherOnDay = (marcherId: string, dayId: string) => {
    const marcher = marchData.marchers.find(m => m.id === marcherId);
    return marcher?.marchingDays?.includes(dayId) || false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-8 w-8 mr-3" />
          Marcher Schedule
        </h1>
        <p className="text-gray-600 mt-2">Select which days each marcher will participate in the march.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Marchers List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Marchers
            </h2>
            <div className="space-y-2">
              {marchData.marchers.map((marcher) => (
                <button
                  key={marcher.id}
                  onClick={() => setSelectedMarcher(marcher.id)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedMarcher === marcher.id
                      ? 'bg-blue-100 border-blue-500 border-2'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{marcher.name}</div>
                  <div className="text-sm text-gray-600">{marcher.email}</div>
                  {marcher.marchingDays && marcher.marchingDays.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {marcher.marchingDays.length} day(s) scheduled
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">March Schedule</h2>
            {selectedMarcher ? (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">
                    Scheduling for: {marchData.marchers.find(m => m.id === selectedMarcher)?.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marchData.days.map((day) => (
                    <div
                      key={day.id}
                      className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                        isMarcherOnDay(selectedMarcher, day.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleDayToggle(selectedMarcher, day.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Day {getDayNumber(day.id)}</span>
                        {isMarcherOnDay(selectedMarcher, day.id) ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {day.route.startPoint} → {day.route.endPoint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a marcher to view and edit their schedule</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcherSchedule; 