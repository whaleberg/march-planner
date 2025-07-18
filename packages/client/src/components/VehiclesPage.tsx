import React, { useState } from 'react';
import { Vehicle } from '@march-organizer/shared';
import { Truck, Edit, Save, X, Plus, Trash2, Calendar, User, Hash, Clock } from 'lucide-react';
import { 
  useMarches, 
  useVehicles, 
  useCreateVehicle, 
  useUpdateVehicle, 
  useDeleteVehicle,
  useMarchDays
} from '../hooks/useMarchData';

const VehiclesPage: React.FC = () => {
  // Get march data to find the marchId
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // tRPC hooks for vehicles and days
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(marchId);
  const { data: daysData, isLoading: daysLoading } = useMarchDays(marchId || '');
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({});

  const vehicles = vehiclesData?.data || [];
  const days = daysData?.data || [];

  const handleEdit = (vehicle: Vehicle) => {
    setEditedVehicle({ ...vehicle });
    setEditingId(vehicle.id);
  };

  const handleSave = async () => {
    if (editedVehicle && marchId) {
      try {
        await updateVehicleMutation.mutateAsync({
          id: editedVehicle.id,
          data: editedVehicle
        });
        setEditingId(null);
        setEditedVehicle(null);
      } catch (error) {
        console.error('Failed to update vehicle:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedVehicle(null);
  };

  const handleAdd = async () => {
    if (newVehicle.name && newVehicle.driver && marchId) {
      try {
        const vehicleData = {
          name: newVehicle.name,
          type: 'van' as const, // Default type
          capacity: 8, // Default capacity
          driver: newVehicle.driver,
          driverPhone: '',
          licensePlate: newVehicle.licensePlate || '',
          notes: newVehicle.notes || ''
        };

        await createVehicleMutation.mutateAsync(vehicleData);
        setIsAdding(false);
        setNewVehicle({});
      } catch (error) {
        console.error('Failed to create vehicle:', error);
      }
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await deleteVehicleMutation.mutateAsync({ id: vehicleId });
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
      }
    }
  };

  const handleDayToggle = async (vehicleId: string, dayId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    // Note: vehicleDays scheduling is not implemented in tRPC yet
    // This would need to be implemented as a separate assignment system
    console.log('Vehicle day scheduling not yet implemented in tRPC');
  };

  if (vehiclesLoading || daysLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Driver *</label>
              <input
                type="text"
                value={newVehicle.driver || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, driver: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                placeholder="Name of person driving this vehicle"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={newVehicle.notes || ''}
                onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe the vehicle's purpose, capacity, and any special features"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAdd}
              disabled={createVehicleMutation.isPending}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {createVehicleMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{createVehicleMutation.isPending ? 'Adding...' : 'Add Vehicle'}</span>
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
        {vehicles.map((vehicle) => {
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
                        disabled={updateVehicleMutation.isPending}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        {updateVehicleMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
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
                        disabled={deleteVehicleMutation.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deleteVehicleMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                      <input
                        type="text"
                        value={currentVehicle.driver}
                        onChange={(e) => setEditedVehicle({ ...currentVehicle, driver: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={currentVehicle.notes || ''}
                        onChange={(e) => setEditedVehicle({ ...currentVehicle, notes: e.target.value })}
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
                  <span>{vehicle.driver}</span>
                </div>
                <p className="text-sm text-gray-600">{vehicle.notes || 'No description'}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Vehicle scheduling not yet implemented</span>
                </div>
                  </>
                )}
              </div>

              {/* Vehicle Schedule Section - Not implemented in tRPC yet */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Schedule
                  </h4>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="text-gray-500">Vehicle scheduling not yet implemented in tRPC</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {vehicles.length === 0 && (
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