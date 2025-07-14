import React, { useState } from 'react';
import { Truck, User, Phone, FileText, Plus, X, Save, Edit, Trash2, Hash } from 'lucide-react';
import {
  useMarches,
  useMarchDay,
  useMarchers,
  useVehicles,
  useVehicleDaySchedules,
  useCreateVehicleDaySchedule,
  useDeleteVehicleDaySchedule
} from '../hooks/useMarchData';
import { Vehicle, Marcher, VehicleDaySchedule } from '@march-organizer/shared';
import { getEntityById } from '../utils/entityMapping';

interface DayVehicleScheduleProps {
  dayId: string;
}

const DayVehicleSchedule: React.FC<DayVehicleScheduleProps> = ({ dayId }) => {
  // Get march data
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // Get day, vehicles, marchers, and vehicle schedules
  const { data: dayData } = useMarchDay(dayId);
  const { data: marchersData } = useMarchers(marchId);
  const { data: vehiclesData } = useVehicles(marchId);
  const { data: vehicleSchedulesData } = useVehicleDaySchedules(dayId);

  // Mutations
  const createVehicleDayScheduleMutation = useCreateVehicleDaySchedule();
  const deleteVehicleDayScheduleMutation = useDeleteVehicleDaySchedule();

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<VehicleDaySchedule>>({});

  const day = dayData?.data;
  const marchers = marchersData?.data || [];
  const vehicles = vehiclesData?.data || [];
  const vehicleSchedules = vehicleSchedulesData?.data || [];
  
  if (!day) return null;

  // For now, we'll show all vehicles and marchers as available
  // In the future, this could be filtered based on assignments
  const availableVehicles = vehicles;
  const availableMarchers = marchers;

  const getVehicleById = (vehicleId: string): Vehicle | undefined => {
    return getEntityById(vehicles, vehicleId);
  };

  const getMarcherById = (marcherId: string): Marcher | undefined => {
    return getEntityById(marchers, marcherId);
  };

  const handleAddSchedule = async () => {
    if (newSchedule.vehicleId && newSchedule.driver && marchId) {
      const schedule: Omit<VehicleDaySchedule, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        vehicleId: newSchedule.vehicleId,
        dayId: dayId,
        marchId: marchId,
        startTime: newSchedule.startTime || '09:00',
        endTime: newSchedule.endTime || '17:00',
        route: newSchedule.route || 'Main route',
        purpose: newSchedule.purpose || 'Transport',
        driver: newSchedule.driver,
        notes: newSchedule.notes || ''
      };

      await createVehicleDayScheduleMutation.mutateAsync(schedule);
      setIsAdding(false);
      setNewSchedule({});
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, updatedSchedule: Partial<VehicleDaySchedule>) => {
    // For now, we'll delete and recreate since we don't have an update mutation
    // In the future, add useUpdateVehicleDaySchedule
    await deleteVehicleDayScheduleMutation.mutateAsync({
      id: scheduleId,
      softDelete: true
    });
    
    if (updatedSchedule.vehicleId && updatedSchedule.driver && marchId) {
      const newSchedule: Omit<VehicleDaySchedule, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> = {
        vehicleId: updatedSchedule.vehicleId,
        dayId: dayId,
        marchId: marchId,
        startTime: updatedSchedule.startTime || '09:00',
        endTime: updatedSchedule.endTime || '17:00',
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-green-600" />
          Vehicle Schedule
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
          disabled={availableVehicles.length === 0}
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Add New Vehicle Schedule */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Add Vehicle to Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle *</label>
              <select
                value={newSchedule.vehicleId || ''}
                onChange={(e) => setNewSchedule({ ...newSchedule, vehicleId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select a vehicle</option>
                {availableVehicles.map(vehicle => (
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
                {availableMarchers.map(marcher => (
                  <option key={marcher.id} value={marcher.id}>
                    {marcher.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={newSchedule.startTime || '09:00'}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={newSchedule.endTime || '17:00'}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            >
              <Save className="h-4 w-4" />
              <span>Add to Schedule</span>
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSchedule({});
              }}
              className="btn-outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Schedules List */}
      <div className="space-y-4">
        {vehicleSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No vehicles scheduled for this day.</p>
            {availableVehicles.length === 0 && (
              <p className="text-sm mt-2">No vehicles are available for this day.</p>
            )}
          </div>
        ) : (
          vehicleSchedules.map((schedule) => {
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Hash className="h-4 w-4 mr-2" />
                      Vehicle: {vehicle.licensePlate || 'No plate'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      Driver: {driver.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact: {vehicle.driverPhone}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Time: {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      Route: {schedule.route}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      Purpose: {schedule.purpose}
                    </div>
                    {schedule.notes && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        Notes: {schedule.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DayVehicleSchedule; 