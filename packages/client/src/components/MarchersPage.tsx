import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Marcher } from '../types';
import { Users, Edit, Save, X, Plus, Trash2, Mail, Phone, User, Calendar, Heart, Shield, Stethoscope } from 'lucide-react';
import { 
  useMarches, 
  useMarchers, 
  useCreateMarcher, 
  useUpdateMarcher, 
  useDeleteMarcher 
} from '../hooks/useMarchData';

const MarchersPage: React.FC = () => {
  // Get march data to find the marchId
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // tRPC hooks for marchers
  const { data: marchersData, isLoading } = useMarchers(marchId);
  const createMarcherMutation = useCreateMarcher();
  const updateMarcherMutation = useUpdateMarcher();
  const deleteMarcherMutation = useDeleteMarcher();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedMarcher, setEditedMarcher] = useState<Marcher | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMarcher, setNewMarcher] = useState<Partial<Marcher>>({});

  const marchers = marchersData?.data || [];

  const handleEdit = (marcher: Marcher) => {
    setEditedMarcher({ ...marcher });
    setEditingId(marcher.id);
  };

  const handleSave = async () => {
    if (editedMarcher && marchId) {
      try {
        await updateMarcherMutation.mutateAsync({
          id: editedMarcher.id,
          data: editedMarcher
        });
        setEditingId(null);
        setEditedMarcher(null);
      } catch (error) {
        console.error('Failed to update marcher:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedMarcher(null);
  };

  const handleAdd = async () => {
    if (newMarcher.name && newMarcher.email && marchId) {
      try {
        const marcherData = {
          name: newMarcher.name,
          email: newMarcher.email,
          phone: newMarcher.phone || '',
          emergencyContact: newMarcher.emergencyContact || '',
          dietaryRestrictions: newMarcher.dietaryRestrictions || '',
          notes: newMarcher.notes || '',
          medic: newMarcher.medic || false,
          peacekeeper: newMarcher.peacekeeper || false
        };

        await createMarcherMutation.mutateAsync(marcherData);
        setIsAdding(false);
        setNewMarcher({});
      } catch (error) {
        console.error('Failed to create marcher:', error);
      }
    }
  };

  const handleDelete = async (marcherId: string) => {
    if (window.confirm('Are you sure you want to delete this marcher?')) {
      try {
        await deleteMarcherMutation.mutateAsync({ id: marcherId });
      } catch (error) {
        console.error('Failed to delete marcher:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marchers...</p>
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
          <div className="bg-gradient-to-r from-red-600 to-blue-600 p-3 rounded-full">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 patriotic-accent">Our Marchers</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Meet the dedicated individuals who are walking together for democracy. 
          Every marcher brings their unique voice and commitment to this movement.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Join the March</span>
        </button>
      </div>

      {/* Add New Marcher Form */}
      {isAdding && (
        <div className="card p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <Heart className="h-6 w-6 mr-3 text-red-600" />
            Join Our Movement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={newMarcher.name || ''}
                onChange={(e) => setNewMarcher({ ...newMarcher, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={newMarcher.email || ''}
                onChange={(e) => setNewMarcher({ ...newMarcher, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={newMarcher.phone || ''}
                onChange={(e) => setNewMarcher({ ...newMarcher, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              <input
                type="text"
                value={newMarcher.emergencyContact || ''}
                onChange={(e) => setNewMarcher({ ...newMarcher, emergencyContact: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Name and phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
              <input
                type="text"
                value={newMarcher.dietaryRestrictions || ''}
                onChange={(e) => setNewMarcher({ ...newMarcher, dietaryRestrictions: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Vegetarian, Gluten-free"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <input
                type="text"
                value={newMarcher.notes || ''}
                onChange={(e) => setNewMarcher({ ...newMarcher, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Any additional information"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMarcher.medic || false}
                  onChange={(e) => setNewMarcher({ ...newMarcher, medic: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Stethoscope className="h-4 w-4 mr-1" />
                  Medic Training
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMarcher.peacekeeper || false}
                  onChange={(e) => setNewMarcher({ ...newMarcher, peacekeeper: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Peacekeeper Training
                </span>
              </label>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAdd}
              disabled={createMarcherMutation.isPending}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {createMarcherMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{createMarcherMutation.isPending ? 'Adding...' : 'Join the March'}</span>
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewMarcher({});
              }}
              className="btn-outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Marchers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marchers.map((marcher) => {
          const isEditing = editingId === marcher.id;
          const currentMarcher = isEditing ? editedMarcher! : marcher;

          return (
            <div key={marcher.id} className="card p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-red-100 to-blue-100 p-2 rounded-full mr-3">
                    <User className="h-6 w-6 text-red-600" />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentMarcher.name}
                      onChange={(e) => setEditedMarcher({ ...currentMarcher, name: e.target.value })}
                      className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{marcher.name}</h3>
                  )}
                </div>
                <div className="flex space-x-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={updateMarcherMutation.isPending}
                        className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50"
                      >
                        {updateMarcherMutation.isPending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-800 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(marcher)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(marcher.id)}
                        disabled={deleteMarcherMutation.isPending}
                        className="text-red-600 hover:text-red-800 p-1 disabled:opacity-50"
                      >
                        {deleteMarcherMutation.isPending ? (
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
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-red-500" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={currentMarcher.email}
                      onChange={(e) => setEditedMarcher({ ...currentMarcher, email: e.target.value })}
                      className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <span>{marcher.email}</span>
                  )}
                </div>

                {marcher.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentMarcher.phone}
                        onChange={(e) => setEditedMarcher({ ...currentMarcher, phone: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500"
                      />
                    ) : (
                      <span>{marcher.phone}</span>
                    )}
                  </div>
                )}

                {marcher.emergencyContact && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Emergency:</span> {marcher.emergencyContact}
                  </div>
                )}

                {marcher.dietaryRestrictions && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    <span className="font-medium">Dietary:</span> {marcher.dietaryRestrictions}
                  </div>
                )}

                {marcher.notes && (
                  <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Notes:</span> {marcher.notes}
                  </div>
                )}

                {/* Training Fields - Edit Mode */}
                {isEditing && (
                  <div className="flex items-center space-x-4 mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentMarcher.medic || false}
                        onChange={(e) => setEditedMarcher({ ...currentMarcher, medic: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                        <Stethoscope className="h-4 w-4 mr-1" />
                        Medic Training
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentMarcher.peacekeeper || false}
                        onChange={(e) => setEditedMarcher({ ...currentMarcher, peacekeeper: e.target.checked })}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Peacekeeper Training
                      </span>
                    </label>
                  </div>
                )}

                {/* Training Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {marcher.medic && (
                    <div className="flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      <Stethoscope className="h-3 w-3 mr-1" />
                      Medic
                    </div>
                  )}
                  {marcher.peacekeeper && (
                    <div className="flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      <Shield className="h-3 w-3 mr-1" />
                      Peacekeeper
                    </div>
                  )}
                </div>

                {/* Schedule Summary - Removed since marchingDays not available in tRPC response */}

                {/* View Schedule Button */}
                <Link
                  to={`/marcher-schedule?marcher=${marcher.id}`}
                  className="inline-flex items-center space-x-2 text-red-600 hover:text-red-800 text-sm font-medium mt-3 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>View Schedule</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarchersPage; 