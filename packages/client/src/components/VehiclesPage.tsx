import React, { useState } from 'react';
import { useMarchData } from '../context/MarchContext';
import { Vehicle } from '../types';
import { Truck, Edit, Save, X, Plus, Trash2, Calendar, User, Hash, Clock } from 'lucide-react';

const VehiclesPage: React.FC = () => {
  const { marchData, updateVehicle, addVehicle, deleteVehicle } = useMarchData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});

  const handleEdit = (vehicle: Vehicle) => {
    setEditedVehicle({ ...vehicle });
    setEditingId(vehicle.id);
  };

  const handleSave = () => {
    if (editedVehicle) {
      updateVehicle(editedVehicle.id, editedVehicle);
      setEditingId(null);
      setEditedVehicle(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedVehicle(null);
  };

  const handleAdd = () => {
    if (newVehicle.name && newVehicle.description && newVehicle.licensePlate && newVehicle.responsiblePerson) {
      const vehicle: Vehicle = {
        id: `vehicle-${Date.now()}`,
        name: newVehicle.name,
        description: newVehicle.description,
        licensePlate: newVehicle.licensePlate,
        responsiblePerson: newVehicle.responsiblePerson,
        vehicleDays: newVehicle.vehicleDays || []
      };
      addVehicle(vehicle);
      setIsAdding(false);
      setNewVehicle({});
    }
  };

  const handleDelete = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      deleteVehicle(vehicleId);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-full">
            <Truck className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Our Vehicles</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Support vehicles that will accompany the march, providing essential services and transportation.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Add New Vehicle Form */}
      {isAdding && (
        <div className="card p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Truck className="h-6 w-6 mr-3 text-green-600" />
            Add New Vehicle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name *</label>
              <input
                type="text"
                value={newVehicle.name || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="e.g., Support Van, Medical Vehicle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Plate *</label>
              <input
                type="text"
                value={newVehicle.licensePlate || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="e.g., MA-12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsible Person *</label>
              <input
                type="text"
                value={newVehicle.responsiblePerson || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, responsiblePerson: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Name of person responsible for this vehicle"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={newVehicle.description || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Describe the vehicle's purpose, capacity, and any special features"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Add Vehicle</span>
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewVehicle({});
              }}
              className="btn-outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vehicles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marchData.vehicles.map((vehicle) => {
          const isEditing = editingId === vehicle.id;
          const isEditingSchedule = editingScheduleId === vehicle.id;
          const currentVehicle = isEditing ? editedVehicle! : vehicle;

          return (
            <div key={vehicle.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Truck className="h-6 w-6 text-green-600 mr-2" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentVehicle.name}
                      onChange={(e) => setEditedVehicle({ ...currentVehicle, name: e.target.value })}
                      className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                  )}
                </div>
                <div className="flex space-x-1">
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
                    <>
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                      <input
                        type="text"
                        value={currentVehicle.licensePlate}
                        onChange={(e) => setEditedVehicle({ ...currentVehicle, licensePlate: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Responsible Person</label>
                      <input
                        type="text"
                        value={currentVehicle.responsiblePerson}
                        onChange={(e) => setEditedVehicle({ ...currentVehicle, responsiblePerson: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={currentVehicle.description}
                        onChange={(e) => setEditedVehicle({ ...currentVehicle, description: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-sm text-gray-600">
                      <Hash className="h-4 w-4 mr-2" />
                      <span className="font-medium">{vehicle.licensePlate}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{vehicle.responsiblePerson}</span>
                    </div>
                    <p className="text-sm text-gray-600">{vehicle.description}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {vehicle.vehicleDays && vehicle.vehicleDays.length > 0
                          ? `${vehicle.vehicleDays.length} day(s)`
                          : 'No days assigned'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Vehicle Schedule Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Schedule
                  </h4>
                  <button
                    onClick={() => setEditingScheduleId(isEditingSchedule ? null : vehicle.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {isEditingSchedule ? 'Done' : 'Edit Schedule'}
                  </button>
                </div>
                
                {isEditingSchedule ? (
                  <div className="space-y-2">
                    {marchData.days.map((day) => {
                      const isScheduled = vehicle.vehicleDays?.includes(day.id) || false;
                      return (
                        <label key={day.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isScheduled}
                            onChange={() => handleDayToggle(vehicle.id, day.id)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Day {marchData.days.findIndex(d => d.id === day.id) + 1}: {day.route.startPoint} → {day.route.endPoint}
                          </span>
                        </label>
                      );
                    })}
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
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>Day {dayNumber}: {day.route.startPoint} → {day.route.endPoint}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500">No days scheduled</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {marchData.vehicles.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles yet</h3>
          <p className="text-gray-600 mb-4">Add your first vehicle to get started.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary"
          >
            Add Vehicle
          </button>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage; 