import React, { useState } from 'react';
import { Truck, User, Phone, FileText, Plus, X, Save, Edit, Trash2, Hash, Calendar } from 'lucide-react';
import {
  useMarches,
  useMarchDays,
  useMarchers,
  useVehicles,
  useVehicleDaySchedules,
  useCreateVehicleDaySchedule,
  useDeleteVehicleDaySchedule
} from '../hooks/useMarchData';
import { Vehicle, Marcher, VehicleDaySchedule } from '@march-organizer/shared';
import { mapVehiclesBySchedules, getEntityById } from '../utils/entityMapping';

const VehicleSchedule: React.FC = () => {
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<VehicleDaySchedule>>({});
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Get march data
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // Get days, vehicles, and marchers
  const { data: daysData } = useMarchDays(marchId || '');
  const { data: marchersData } = useMarchers(marchId);
  const { data: vehiclesData } = useVehicles(marchId);

  // Get all vehicle schedules for this march
  const { data: vehicleSchedulesData } = useVehicleDaySchedules(undefined);

  // Mutations
  const createVehicleDayScheduleMutation = useCreateVehicleDaySchedule();
  const deleteVehicleDayScheduleMutation = useDeleteVehicleDaySchedule();

  const days = daysData?.data || [];
  const marchers = marchersData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const vehicleSchedules = vehicleSchedulesData?.data || [];

  const getVehicleById = (vehicleId: string): Vehicle | undefined => {
    return getEntityById(vehicles, vehicleId);
  };

  const getMarcherById = (marcherId: string): Marcher | undefined => {
    return getEntityById(marchers, marcherId);
  };

  const handleAddSchedule = async () => {
    if (newSchedule.vehicleId && newSchedule.driver && newSchedule.startTime && newSchedule.endTime && selectedDay && marchId) {
      const schedule: Omit<VehicleDaySchedule, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        vehicleId: newSchedule.vehicleId,
        dayId: selectedDay,
        marchId: marchId,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        route: newSchedule.route || 'Main route',
        purpose: newSchedule.purpose || 'Transport',
        driver: newSchedule.driver,
        notes: newSchedule.notes || ''
      };

      await createVehicleDayScheduleMutation.mutateAsync(schedule);
      setIsAdding(false);
      setNewSchedule({});
      setSelectedDay('');
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, updatedSchedule: Partial<VehicleDaySchedule>) => {
    // For now, we'll delete and recreate since we don't have an update mutation
    await deleteVehicleDayScheduleMutation.mutateAsync({
      id: scheduleId,
      softDelete: true
    });
    
    if (updatedSchedule.vehicleId && updatedSchedule.driver && updatedSchedule.startTime && updatedSchedule.endTime && marchId) {
      const newSchedule: Omit<VehicleDaySchedule, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        vehicleId: updatedSchedule.vehicleId,
        dayId: updatedSchedule.dayId || selectedDay,
        marchId: marchId,
        startTime: updatedSchedule.startTime,
        endTime: updatedSchedule.endTime,
        route: updatedSchedule.route || 'Main route',
        purpose: updatedSchedule.purpose || 'Transport',
        driver: updatedSchedule.driver,
        notes: updatedSchedule.notes || ''
      };

      await createVehicleDayScheduleMutation.mutateAsync(newSchedule);
    }
    setEditingScheduleId(null);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle schedule?')) {
      await deleteVehicleDayScheduleMutation.mutateAsync({
        id: scheduleId,
        softDelete: true
      });
    }
  };

  // Get vehicle schedules for a specific day using generic function
  const getVehicleSchedulesForDay = (dayId: string) => {
    return mapVehiclesBySchedules(vehicles, vehicleSchedules, { dayId })
      .map(mapping => mapping.relationship);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
            <Truck className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Vehicle Schedule by Day</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage vehicle assignments and drivers for each day of the march.
        </p>
      </div>

      {/* Add New Schedule Section */}
      <div className="card p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Plus className="h-6 w-6 mr-3 text-green-600" />
            Add Vehicle Schedule
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Cancel' : 'Add Schedule'}</span>
          </button>
        </div>

        {isAdding && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Vehicle Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day *</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a day</option>
                  {days.map((day, index) => (
                    <option key={day.id} value={day.id}>
                      Day {index + 1}: {day.route.startPoint} → {day.route.endPoint}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle *</label>
                <select
                  value={newSchedule.vehicleId || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, vehicleId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.licensePlate || 'No plate'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver *</label>
                <select
                  value={newSchedule.driver || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, driver: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a driver</option>
                  {marchers.map(marcher => (
                    <option key={marcher.id} value={marcher.id}>
                      {marcher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                <input
                  type="time"
                  value={newSchedule.startTime || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                <input
                  type="time"
                  value={newSchedule.endTime || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                <input
                  type="text"
                  value={newSchedule.route || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, route: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Route description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
                <input
                  type="text"
                  value={newSchedule.purpose || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, purpose: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Transport, Support, etc."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newSchedule.notes || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Any additional notes about this vehicle's role for the day"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleAddSchedule}
                className="btn-primary flex items-center space-x-2"
                disabled={!newSchedule.vehicleId || !newSchedule.driver || !newSchedule.startTime || !newSchedule.endTime || !selectedDay}
              >
                <Save className="h-4 w-4" />
                <span>Add Schedule</span>
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewSchedule({});
                  setSelectedDay('');
                }}
                className="btn-outline"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle Schedules by Day */}
      <div className="space-y-6">
        {days.map((day, dayIndex) => {
          const dayNumber = dayIndex + 1;
          const dayVehicles = getVehicleSchedulesForDay(day.id);

          return (
            <div key={day.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-green-600" />
                    Day {dayNumber}: {day.route.startPoint} → {day.route.endPoint}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {dayVehicles.length} vehicle{dayVehicles.length !== 1 ? 's' : ''} scheduled
                </div>
              </div>

              {dayVehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No vehicles scheduled for this day.</p>
                  <p className="text-sm mt-1">Add a vehicle schedule above to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayVehicles.map((schedule) => {
                    const vehicle = getVehicleById(schedule.vehicleId);
                    const driver = getMarcherById(schedule.driver);
                    const isEditing = editingScheduleId === schedule.id;

                    if (!vehicle || !driver) return null;

                    return (
                      <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="text-lg font-medium text-gray-900">{vehicle.name}</h4>
                          </div>
                          <div className="flex space-x-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => {
                                    const updatedSchedule: Partial<VehicleDaySchedule> = {
                                      vehicleId: schedule.vehicleId,
                                      driver: schedule.driver,
                                      startTime: schedule.startTime,
                                      endTime: schedule.endTime,
                                      route: schedule.route,
                                      purpose: schedule.purpose,
                                      notes: schedule.notes
                                    };
                                    handleUpdateSchedule(schedule.id, updatedSchedule);
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingScheduleId(null)}
                                  className="text-gray-600 hover:text-gray-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingScheduleId(schedule.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Hash className="h-4 w-4 mr-2" />
                            <span className="font-medium">{vehicle.licensePlate || 'No plate'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{driver.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {isEditing ? (
                              <input
                                type="text"
                                value={vehicle.driverPhone}
                                onChange={(e) => {
                                  // This would need to update the vehicle, not the schedule
                                  // For now, just show the current value
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                disabled
                              />
                            ) : (
                              <span>{vehicle.driverPhone}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="font-medium">Time:</span> {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <span className="font-medium">Route:</span> {schedule.route}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <span className="font-medium">Purpose:</span> {schedule.purpose}
                            </div>
                            {schedule.notes && (
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <span className="font-medium">Notes:</span> {schedule.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VehicleSchedule; 