import React, { useMemo, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  useGetNgoOrganizationsQuery,
  useCreateNgoOrganizationMutation,
  useUpdateNgoOrganizationMutation,
  useDeleteNgoOrganizationMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import {
  normalizeOrganization,
  organizationPayload,
  formatEstablishedDate,
  todayDateInputValue
} from '../../utils/ngoDate';

export default function Organizations() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'NGO',
    registrationNumber: '',
    country: '',
    city: '',
    email: '',
    phone: '',
    status: 'Active',
    established: ''
  });

  const listParams = useMemo(() => {
    const filters = {};
    if (filterType) filters.type = filterType;
    if (filterStatus) filters.status = filterStatus;
    return filters;
  }, [filterType, filterStatus]);

  const {
    data: rawOrganizations = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetNgoOrganizationsQuery(listParams);

  const [createOrganization, { isLoading: creating }] = useCreateNgoOrganizationMutation();
  const [updateOrganization, { isLoading: updating }] = useUpdateNgoOrganizationMutation();
  const [deleteOrganization] = useDeleteNgoOrganizationMutation();

  const saving = creating || updating;
  const organizations = useMemo(
    () => (rawOrganizations || []).map(normalizeOrganization),
    [rawOrganizations]
  );
  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to fetch organizations')
    : null;

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      name: '',
      type: 'NGO',
      registrationNumber: '',
      country: '',
      city: '',
      email: '',
      phone: '',
      status: 'Active',
      established: ''
    });
    setShowModal(true);
  };

  const handleEdit = (org) => {
    setModalMode('edit');
    setSelectedOrg(org);
    setFormData(normalizeOrganization(org));
    setShowModal(true);
  };

  const handleView = (org) => {
    setModalMode('view');
    setSelectedOrg(org);
    setFormData(normalizeOrganization(org));
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id).unwrap();
      } catch (err) {
        alert('Failed to delete organization: ' + getNgoErrorMessage(err, 'Unknown error'));
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = organizationPayload(formData);
      if (modalMode === 'add') {
        await createOrganization(payload).unwrap();
      } else if (modalMode === 'edit') {
        await updateOrganization({ id: selectedOrg.id, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save organization: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const modalCopy = ngoModalCopy('Organization', modalMode);

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Organization</h1>
          <p className="text-gray-600 mt-1">Manage your registered organization profile</p>
        </div>
        {organizations.length === 0 && (
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={20} />
          <span>Add Organization</span>
        </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-4 md:flex-row flex-col gap-2">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          >
            <option value="">All Types</option>
            <option value="NGO">NGO</option>
            <option value="INGO">INGO</option>
            <option value="CBO">CBO</option>
            <option value="FBO">FBO</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
          <button
            onClick={refetch}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Organizations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
            <span className="text-gray-600">Loading organizations...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Established
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {filteredOrganizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">{org.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                      {org.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{org.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {[org.city, org.country].filter(Boolean).join(', ') || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {formatEstablishedDate(org.established ?? org.foundedDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        org.status === 'Active' || org.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(org)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(org)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>

            {filteredOrganizations.length === 0 && !loading && (
              <div className="text-center py-12">
                <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No organizations found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <NGOModal
        open={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={modalCopy.title}
        subtitle={modalCopy.subtitle}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save Organization"
      >
        <NGOFormGrid>
          <NGOFormField label="Organization Name" required>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Enter organization name"
            />
          </NGOFormField>

          <NGOFormField label="Type" required>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
            >
              <option>NGO</option>
              <option>INGO</option>
              <option>CBO</option>
              <option>FBO</option>
            </select>
          </NGOFormField>

          <NGOFormField label="Registration Number" required>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Enter registration number"
            />
          </NGOFormField>

          <NGOFormField
            label="Established Date"
            hint={
              modalMode === 'view'
                ? (formData.established ? formatEstablishedDate(formData.established) : 'Not set')
                : 'Date the organization was officially registered or founded'
            }
          >
            <input
              type="date"
              value={formData.established || ''}
              max={todayDateInputValue()}
              onChange={(e) => setFormData({ ...formData, established: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
            />
          </NGOFormField>

          <NGOFormField label="Country" required>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Enter country"
            />
          </NGOFormField>

          <NGOFormField label="City" required>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Enter city"
            />
          </NGOFormField>

          <NGOFormField label="Email" required>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Enter email"
            />
          </NGOFormField>

          <NGOFormField label="Phone" required>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
              placeholder="Enter phone number"
            />
          </NGOFormField>

          <NGOFormField label="Status" required>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={modalMode === 'view'}
              className={NGO_INPUT_CLASS}
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
          </NGOFormField>
        </NGOFormGrid>
      </NGOModal>
    </div>
  );
}
