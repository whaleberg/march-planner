import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarchData } from '../context/MarchContext';
import { Marcher } from '../types';
import { Users, Edit, Save, X, Plus, Trash2, Mail, Phone, User, Calendar, Heart } from 'lucide-react';

const MarchersPage: React.FC = () => {
  const { marchData, updateMarcher, addMarcher, deleteMarcher } = useMarchData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedMarcher, setEditedMarcher] = useState<Marcher | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMarcher, setNewMarcher] = useState<Partial<Marcher>>({});

  const handleEdit = (marcher: Marcher) => {
    setEditedMarcher({ ...marcher });
    setEditingId(marcher.id);
  };

  const handleSave = () => {
    if (editedMarcher) {
      updateMarcher(editedMarcher.id, editedMarcher);
      setEditingId(null);
      setEditedMarcher(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedMarcher(null);
  };

  const handleAdd = () => {
    if (newMarcher.name && newMarcher.email) {
      const marcher: Marcher = {
        id: `marcher-${Date.now()}`,
        name: newMarcher.name,
        email: newMarcher.email,
        phone: newMarcher.phone || '',
        emergencyContact: newMarcher.emergencyContact || '',
        dietaryRestrictions: newMarcher.dietaryRestrictions || '',
        notes: newMarcher.notes || ''
      };
      addMarcher(marcher);
      setIsAdding(false);
      setNewMarcher({});
    }
  };

  const handleDelete = (marcherId: string) => {
    if (window.confirm('Are you sure you want to delete this marcher?')) {
      deleteMarcher(marcherId);
    }
  };

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
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Join the March</span>
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
        {marchData.marchers.map((marcher) => {
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
                        className="text-green-600 hover:text-green-800 p-1"
                      >
                        <Save className="h-4 w-4" />
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
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
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

                {/* Schedule Summary */}
                {marcher.marchingDays && marcher.marchingDays.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="font-medium">Scheduled for {marcher.marchingDays.length} day(s)</span>
                  </div>
                )}

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