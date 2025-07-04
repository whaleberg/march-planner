import React, { useState } from 'react';
import { useMarchData } from '../context/MarchContext';
import { Vehicle, VehicleDaySchedule, Marcher } from '../types';
import { Truck, User, Phone, FileText, Plus, X, Save, Edit, Trash2, Hash, Calendar } from 'lucide-react';

const VehicleSchedule: React.FC = () => {
  const { marchData, updateDay } = useMarchData();
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<VehicleDaySchedule>>({});
  const [selectedDay, setSelectedDay] = useState<string>('');

  const getVehicleById = (vehicleId: string): Vehicle | undefined => {
    return marchData.vehicles.find(v => v.id === vehicleId);
  };

  const getMarcherById = (marcherId: string): Marcher | undefined => {
    return marchData.marchers.find(m => m.id === marcherId);
  };

  const handleAddSchedule = () => {
    if (newSchedule.vehicleId && newSchedule.driver && newSchedule.driverContact && selectedDay) {
      const schedule: VehicleDaySchedule = {
        vehicleId: newSchedule.vehicleId,
        driver: newSchedule.driver,
        driverContact: newSchedule.driverContact,
        notes: newSchedule.notes || ''
      };

      const day = marchData.days.find(d => d.id === selectedDay);
      if (day) {
        const updatedDay = {
          ...day,
          vehicleSchedules: [...day.vehicleSchedules, schedule]
        };
        updateDay(selectedDay, updatedDay);
        setIsAdding(false);
        setNewSchedule({});
        setSelectedDay('');
      }
    }
  };

  const handleUpdateSchedule = (dayId: string, scheduleIndex: number, updatedSchedule: VehicleDaySchedule) => {
    const day = marchData.days.find(d => d.id === dayId);
    if (!day) return;

    const updatedSchedules = [...day.vehicleSchedules];
    updatedSchedules[scheduleIndex] = updatedSchedule;

    const updatedDay = {
      ...day,
      vehicleSchedules: updatedSchedules
    };

    updateDay(dayId, updatedDay);
    setEditingScheduleId(null);
  };

  const handleDeleteSchedule = (dayId: string, scheduleIndex: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle schedule?')) {
      const day = marchData.days.find(d => d.id === dayId);
      if (!day) return;

      const updatedSchedules = day.vehicleSchedules.filter((_, index) => index !== scheduleIndex);
      
      const updatedDay = {
        ...day,
        vehicleSchedules: updatedSchedules
      };

      updateDay(dayId, updatedDay);
    }
  };

  // Get available vehicles for a specific day (vehicles that are scheduled for that day)
  const getAvailableVehiclesForDay = (dayId: string): Vehicle[] => {
    return marchData.vehicles.filter(vehicle => 
      vehicle.vehicleDays?.includes(dayId)
    );
  };

  // Get available marchers for a specific day
  const getAvailableMarchersForDay = (dayId: string): Marcher[] => {
    return marchData.marchers.filter(marcher => 
      marcher.marchingDays?.includes(dayId)
    );
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
                  {marchData.days.map((day, index) => (
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
                  disabled={!selectedDay}
                >
                  <option value="">Select a vehicle</option>
                  {selectedDay && getAvailableVehiclesForDay(selectedDay).map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
                {selectedDay && getAvailableVehiclesForDay(selectedDay).length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No vehicles available for this day</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver *</label>
                <select
                  value={newSchedule.driver || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, driver: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                  disabled={!selectedDay}
                >
                  <option value="">Select a driver</option>
                  {selectedDay && getAvailableMarchersForDay(selectedDay).map(marcher => (
                    <option key={marcher.id} value={marcher.id}>
                      {marcher.name}
                    </option>
                  ))}
                </select>
                {selectedDay && getAvailableMarchersForDay(selectedDay).length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No marchers available for this day</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Contact *</label>
                <input
                  type="text"
                  value={newSchedule.driverContact || ''}
                  onChange={(e) => setNewSchedule({ ...newSchedule, driverContact: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Phone number or contact info"
                  required
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
                disabled={!newSchedule.vehicleId || !newSchedule.driver || !newSchedule.driverContact || !selectedDay}
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
        {marchData.days.map((day, dayIndex) => {
          const dayNumber = dayIndex + 1;
          const dayVehicles = day.vehicleSchedules || [];

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
                  {dayVehicles.map((schedule, scheduleIndex) => {
                    const vehicle = getVehicleById(schedule.vehicleId);
                    const driver = getMarcherById(schedule.driver);
                    const isEditing = editingScheduleId === `${day.id}-${scheduleIndex}`;

                    if (!vehicle || !driver) return null;

                    return (
                      <div key={`${day.id}-${scheduleIndex}`} className="border border-gray-200 rounded-lg p-4">
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
                                    const updatedSchedule: VehicleDaySchedule = {
                                      vehicleId: schedule.vehicleId,
                                      driver: schedule.driver,
                                      driverContact: schedule.driverContact,
                                      notes: schedule.notes
                                    };
                                    handleUpdateSchedule(day.id, scheduleIndex, updatedSchedule);
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
                                  onClick={() => setEditingScheduleId(`${day.id}-${scheduleIndex}`)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSchedule(day.id, scheduleIndex)}
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
                            <span className="font-medium">{vehicle.licensePlate}</span>
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
                                value={schedule.driverContact}
                                onChange={(e) => {
                                  const updatedSchedules = [...day.vehicleSchedules];
                                  updatedSchedules[scheduleIndex] = { ...schedule, driverContact: e.target.value };
                                  const updatedDay = { ...day, vehicleSchedules: updatedSchedules };
                                  updateDay(day.id, updatedDay);
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            ) : (
                              <span>{schedule.driverContact}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <FileText className="h-4 w-4 mr-2" />
                              <span className="font-medium">Notes:</span>
                            </div>
                            {isEditing ? (
                              <textarea
                                value={schedule.notes}
                                onChange={(e) => {
                                  const updatedSchedules = [...day.vehicleSchedules];
                                  updatedSchedules[scheduleIndex] = { ...schedule, notes: e.target.value };
                                  const updatedDay = { ...day, vehicleSchedules: updatedSchedules };
                                  updateDay(day.id, updatedDay);
                                }}
                                rows={3}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              />
                            ) : (
                              <p className="text-sm text-gray-900">{schedule.notes || 'No notes'}</p>
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