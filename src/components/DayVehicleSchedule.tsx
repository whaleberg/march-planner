import React, { useState } from 'react';
import { useMarchData } from '../context/MarchContext';
import { Vehicle, VehicleDaySchedule, Marcher } from '../types';
import { Truck, User, Phone, FileText, Plus, X, Save, Edit, Trash2, Hash } from 'lucide-react';

interface DayVehicleScheduleProps {
  dayId: string;
}

const DayVehicleSchedule: React.FC<DayVehicleScheduleProps> = ({ dayId }) => {
  const { marchData, updateDay } = useMarchData();
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<VehicleDaySchedule>>({});

  const day = marchData.days.find(d => d.id === dayId);
  if (!day) return null;

  const availableVehicles = marchData.vehicles.filter(vehicle => 
    vehicle.vehicleDays?.includes(dayId)
  );

  const availableMarchers = marchData.marchers.filter(marcher => 
    marcher.marchingDays?.includes(dayId)
  );

  const getVehicleById = (vehicleId: string): Vehicle | undefined => {
    return marchData.vehicles.find(v => v.id === vehicleId);
  };

  const getMarcherById = (marcherId: string): Marcher | undefined => {
    return marchData.marchers.find(m => m.id === marcherId);
  };

  const handleAddSchedule = () => {
    if (newSchedule.vehicleId && newSchedule.driver && newSchedule.driverContact) {
      const schedule: VehicleDaySchedule = {
        vehicleId: newSchedule.vehicleId,
        driver: newSchedule.driver,
        driverContact: newSchedule.driverContact,
        notes: newSchedule.notes || ''
      };

      const updatedDay = {
        ...day,
        vehicleSchedules: [...day.vehicleSchedules, schedule]
      };

      updateDay(dayId, updatedDay);
      setIsAdding(false);
      setNewSchedule({});
    }
  };

  const handleUpdateSchedule = (scheduleIndex: number, updatedSchedule: VehicleDaySchedule) => {
    const updatedSchedules = [...day.vehicleSchedules];
    updatedSchedules[scheduleIndex] = updatedSchedule;

    const updatedDay = {
      ...day,
      vehicleSchedules: updatedSchedules
    };

    updateDay(dayId, updatedDay);
    setEditingScheduleId(null);
  };

  const handleDeleteSchedule = (scheduleIndex: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle schedule?')) {
      const updatedSchedules = day.vehicleSchedules.filter((_, index) => index !== scheduleIndex);
      
      const updatedDay = {
        ...day,
        vehicleSchedules: updatedSchedules
      };

      updateDay(dayId, updatedDay);
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
                    {vehicle.name} ({vehicle.licensePlate})
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
        {day.vehicleSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No vehicles scheduled for this day.</p>
            {availableVehicles.length === 0 && (
              <p className="text-sm mt-2">No vehicles are available for this day.</p>
            )}
          </div>
        ) : (
          day.vehicleSchedules.map((schedule, index) => {
            const vehicle = getVehicleById(schedule.vehicleId);
            const driver = getMarcherById(schedule.driver);
            const isEditing = editingScheduleId === `${schedule.vehicleId}-${index}`;

            if (!vehicle || !driver) return null;

            return (
              <div key={`${schedule.vehicleId}-${index}`} className="border border-gray-200 rounded-lg p-4">
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
                            handleUpdateSchedule(index, updatedSchedule);
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
                          onClick={() => setEditingScheduleId(`${schedule.vehicleId}-${index}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(index)}
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
                      <span className="font-medium">License Plate:</span>
                    </div>
                    <p className="text-sm text-gray-900">{vehicle.licensePlate}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Driver:</span>
                    </div>
                    <p className="text-sm text-gray-900">{driver.name}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="font-medium">Driver Contact:</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={schedule.driverContact}
                        onChange={(e) => {
                          const updatedSchedules = [...day.vehicleSchedules];
                          updatedSchedules[index] = { ...schedule, driverContact: e.target.value };
                          const updatedDay = { ...day, vehicleSchedules: updatedSchedules };
                          updateDay(dayId, updatedDay);
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{schedule.driverContact}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="font-medium">Notes:</span>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={schedule.notes}
                        onChange={(e) => {
                          const updatedSchedules = [...day.vehicleSchedules];
                          updatedSchedules[index] = { ...schedule, notes: e.target.value };
                          const updatedDay = { ...day, vehicleSchedules: updatedSchedules };
                          updateDay(dayId, updatedDay);
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
          })
        )}
      </div>
    </div>
  );
};

export default DayVehicleSchedule; 