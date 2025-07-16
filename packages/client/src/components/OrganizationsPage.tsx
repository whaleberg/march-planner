import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PartnerOrganization } from '../types';
import { Building2, Edit, Save, X, Plus, Trash2, Mail, Phone, Globe, User, Calendar } from 'lucide-react';
import { 
  useMarches, 
  usePartnerOrganizations, 
  useCreateOrganization, 
  useUpdateOrganization, 
  useDeleteOrganization
} from '../hooks/useMarchData';

const OrganizationsPage: React.FC = () => {
  // Get march data to find the marchId
  const { data: marchesData } = useMarches();
  const marchId = marchesData?.data?.[0]?.id;

  // tRPC hooks for organizations
  const { data: organizationsData, isLoading } = usePartnerOrganizations(marchId);
  const createOrganizationMutation = useCreateOrganization();
  const updateOrganizationMutation = useUpdateOrganization();
  const deleteOrganizationMutation = useDeleteOrganization();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedOrg, setEditedOrg] = useState<PartnerOrganization | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newOrg, setNewOrg] = useState<Partial<PartnerOrganization>>({});

  const organizations = organizationsData?.data || [];

  const handleEdit = (org: PartnerOrganization) => {
    setEditedOrg({ ...org });
    setEditingId(org.id);
  };

  const handleSave = async () => {
    if (editedOrg) {
      try {
        await updateOrganizationMutation.mutateAsync({
          id: editedOrg.id,
          data: editedOrg
        });
        setEditingId(null);
        setEditedOrg(null);
      } catch (error) {
        console.error('Failed to update organization:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedOrg(null);
  };

  const handleAdd = async () => {
    if (newOrg.name && newOrg.description && marchId) {
      try {
        const orgData = {
          name: newOrg.name,
          description: newOrg.description,
          website: newOrg.website || '',
          contactPerson: newOrg.contactPerson || '',
          contactEmail: newOrg.contactEmail || '',
          contactPhone: newOrg.contactPhone || ''
        };

        await createOrganizationMutation.mutateAsync(orgData);
        setIsAdding(false);
        setNewOrg({});
      } catch (error) {
        console.error('Failed to create organization:', error);
      }
    }
  };

  const handleDelete = async (orgId: string) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganizationMutation.mutateAsync({ id: orgId });
      } catch (error) {
        console.error('Failed to delete organization:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organizations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Building2 className="h-8 w-8 mr-3" />
          Partner Organizations
        </h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Add New Organization Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Organization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={newOrg.name || ''}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                value={newOrg.website || ''}
                onChange={(e) => setNewOrg({ ...newOrg, website: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="https://example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={newOrg.description || ''}
                onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
              <input
                type="text"
                value={newOrg.contactPerson || ''}
                onChange={(e) => setNewOrg({ ...newOrg, contactPerson: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                value={newOrg.contactEmail || ''}
                onChange={(e) => setNewOrg({ ...newOrg, contactEmail: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                type="tel"
                value={newOrg.contactPhone || ''}
                onChange={(e) => setNewOrg({ ...newOrg, contactPhone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={createOrganizationMutation.isPending}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
            >
              {createOrganizationMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{createOrganizationMutation.isPending ? 'Adding...' : 'Add Organization'}</span>
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewOrg({});
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* Organizations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => {
          const isEditing = editingId === org.id;
          const currentOrg = isEditing ? editedOrg! : org;

          return (
            <div key={org.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 text-orange-600 mr-2" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentOrg.name}
                      onChange={(e) => setEditedOrg({ ...currentOrg, name: e.target.value })}
                      className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                  )}
                </div>
                <div className="flex space-x-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={updateOrganizationMutation.isPending}
                        className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      >
                        {updateOrganizationMutation.isPending ? (
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
                        onClick={() => handleEdit(org)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        disabled={deleteOrganizationMutation.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {deleteOrganizationMutation.isPending ? (
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
                  <textarea
                    value={currentOrg.description}
                    onChange={(e) => setEditedOrg({ ...currentOrg, description: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{org.description}</p>
                )}

                {org.website && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Globe className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <input
                        type="url"
                        value={currentOrg.website}
                        onChange={(e) => setEditedOrg({ ...currentOrg, website: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {org.website}
                      </a>
                    )}
                  </div>
                )}

                {org.contactPerson && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentOrg.contactPerson}
                        onChange={(e) => setEditedOrg({ ...currentOrg, contactPerson: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span>{org.contactPerson}</span>
                    )}
                  </div>
                )}

                {org.contactEmail && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={currentOrg.contactEmail}
                        onChange={(e) => setEditedOrg({ ...currentOrg, contactEmail: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <a href={`mailto:${org.contactEmail}`} className="hover:underline">
                        {org.contactEmail}
                      </a>
                    )}
                  </div>
                )}

                {org.contactPhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentOrg.contactPhone}
                        onChange={(e) => setEditedOrg({ ...currentOrg, contactPhone: e.target.value })}
                        className="flex-1 border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <a href={`tel:${org.contactPhone}`} className="hover:underline">
                        {org.contactPhone}
                      </a>
                    )}
                  </div>
                )}

                {/* Schedule Summary - Removed since partnerDays not available in tRPC response */}
                {/* View Schedule Button */}
                <Link
                  to={`/org-schedule?org=${org.id}`}
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-800 text-sm font-medium mt-3"
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

export default OrganizationsPage; 