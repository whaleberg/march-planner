import React, { useState } from 'react';
import { useMarchData } from '../context/MarchContext';
import { Truck, Calendar, Hash, User, Clock, Save, X, Users } from 'lucide-react';
import { VehicleViewMode } from '../types';
import VehicleSchedule from './VehicleSchedule';

const VehicleScheduleByVehicle: React.FC = () => {
  const { marchData, updateVehicle } = useMarchData();
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<VehicleViewMode>('by-vehicle');

  const handleDayToggle = (vehicleId: string, dayId: string) => {
    const vehicle = marchData.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    const currentDays = vehicle.vehicleDays || [];
    const updatedDays = currentDays.includes(dayId)
      ? currentDays.filter(id => id !== dayId)
      : [...currentDays, dayId];

    updateVehicle(vehicleId, {
      ...vehicle,
      vehicleDays: updatedDays
    });
  };

  const handleSave = () => {
    setEditingVehicleId(null);
  };

  const handleCancel = () => {
    setEditingVehicleId(null);
  };

  // If view mode is by-day, render the VehicleSchedule component
  if (viewMode === 'by-day') {
    return <VehicleSchedule />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
            <Truck className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Vehicle Schedule by Vehicle</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Assign vehicles to specific days of the march. Select which days each vehicle will be available.
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-2 inline-flex">
          <button
            onClick={() => setViewMode('by-vehicle')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'by-vehicle'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            View by Vehicle
          </button>
          <button
            onClick={() => setViewMode('by-day')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'by-day'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            View by Day
          </button>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="space-y-6">
        {marchData.vehicles.map((vehicle) => {
          const isEditing = editingVehicleId === vehicle.id;

          return (
            <div key={vehicle.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Truck className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{vehicle.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        {vehicle.licensePlate}
                      </span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {vehicle.responsiblePerson}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {vehicle.vehicleDays?.length || 0} day{(vehicle.vehicleDays?.length || 0) !== 1 ? 's' : ''} assigned
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingVehicleId(vehicle.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Clock className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{vehicle.description}</p>

              {/* Days Assignment */}
              {isEditing ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Assign Days</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {marchData.days.map((day, index) => {
                      const isAssigned = vehicle.vehicleDays?.includes(day.id) || false;
                      return (
                        <label key={day.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleDayToggle(vehicle.id, day.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Day {index + 1}: {day.route.startPoint} → {day.route.endPoint}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {vehicle.vehicleDays && vehicle.vehicleDays.length > 0 ? (
                    <div className="space-y-1">
                      {vehicle.vehicleDays.map((dayId) => {
                        const day = marchData.days.find(d => d.id === dayId);
                        const dayNumber = marchData.days.findIndex(d => d.id === dayId) + 1;
                        return day ? (
                          <div key={dayId} className="flex items-center">
                            <Calendar className="h-3 w-3 mr-2" />
                            <span>Day {dayNumber}: {day.route.startPoint} → {day.route.endPoint}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No days assigned</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {marchData.vehicles.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles yet</h3>
          <p className="text-gray-600 mb-4">Add vehicles first to start scheduling.</p>
        </div>
      )}
    </div>
  );
};

export default VehicleScheduleByVehicle; 