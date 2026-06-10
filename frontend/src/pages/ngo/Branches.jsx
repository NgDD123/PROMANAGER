import React, { useMemo, useState } from 'react';
import {
  GitBranch,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Building2,
  Loader2
} from 'lucide-react';
import {
  useGetNgoBranchesQuery,
  useGetNgoOrganizationsQuery,
  useCreateNgoBranchMutation,
  useUpdateNgoBranchMutation,
  useDeleteNgoBranchMutation,
  getNgoErrorMessage,
} from '../../store/actions/ngo.js';
import NGOModal, { NGOFormGrid, NGOFormField, NGO_INPUT_CLASS, ngoModalCopy } from '../../components/ngo/NGOModal';
import { todayDateInputValue } from '../../utils/ngoDate';
import { resolveNgoTenantOrganization, ngoEntityModalCopy } from '../../utils/ngoTenant.js';

export default function Branches() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterType, setFilterType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    organizationId: '',
    type: 'Field Office',
    country: '',
    city: '',
    address: '',
    manager: '',
    phone: '',
    email: '',
    status: 'Active',
    established: ''
  });

  const listParams = useMemo(() => {
    const filters = {};
    if (filterOrg) filters.organizationId = filterOrg;
    if (filterType) filters.type = filterType;
    return filters;
  }, [filterOrg, filterType]);

  const { data: organizations = [] } = useGetNgoOrganizationsQuery();
  const { tenantOrganizationId, tenantOrganizationName } = resolveNgoTenantOrganization(organizations);
  const {
    data: branches = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetNgoBranchesQuery(listParams);

  const [createBranch, { isLoading: creating }] = useCreateNgoBranchMutation();
  const [updateBranch, { isLoading: updating }] = useUpdateNgoBranchMutation();
  const [deleteBranch] = useDeleteNgoBranchMutation();

  const saving = creating || updating;
  const errorMessage = error
    ? getNgoErrorMessage(error, 'Failed to fetch branches')
    : null;

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      name: '',
      code: '',
      organizationId: tenantOrganizationId,
      type: 'Field Office',
      country: '',
      city: '',
      address: '',
      manager: '',
      phone: '',
      email: '',
      status: 'Active',
      established: ''
    });
    setShowModal(true);
  };

  const handleEdit = (branch) => {
    setModalMode('edit');
    setSelectedBranch(branch);
    setFormData({ ...branch, organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleView = (branch) => {
    setModalMode('view');
    setSelectedBranch(branch);
    setFormData({ ...branch, organizationId: tenantOrganizationId });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranch(id).unwrap();
      } catch (err) {
        alert('Failed to delete branch: ' + getNgoErrorMessage(err, 'Unknown error'));
      }
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData, organizationId: tenantOrganizationId };
      if (modalMode === 'add') {
        await createBranch(payload).unwrap();
      } else if (modalMode === 'edit') {
        await updateBranch({ id: selectedBranch.id, ...payload }).unwrap();
      }
      setShowModal(false);
    } catch (err) {
      alert('Failed to save branch: ' + getNgoErrorMessage(err, 'Unknown error'));
    }
  };

  const modalCopy =
    ngoEntityModalCopy('Branch', modalMode, tenantOrganizationName) ||
    ngoModalCopy('Branch', modalMode);

  const filteredBranches = branches.filter((branch) => {
    const q = searchTerm.toLowerCase();
    return (
      (branch.name || '').toLowerCase().includes(q) ||
      (branch.code || '').toLowerCase().includes(q) ||
      (branch.city || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Branches</h1>
          <p className="text-gray-600 mt-1">Manage all organizational branches and offices</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus size={20} />
          <span>Add Branch</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-4 md:flex-row flex-col gap-2">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select 
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          >
            <option value="">All Organizations</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          >
            <option value="">All Types</option>
            <option value="Headquarters">Headquarters</option>
            <option value="Regional Office">Regional Office</option>
            <option value="Field Office">Field Office</option>
            <option value="Sub-Office">Sub-Office</option>
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

      {/* Branches Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
          <span className="text-gray-600">Loading branches...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <GitBranch className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{branch.name}</h3>
                    {branch.code ? <p className="text-sm text-gray-500">{branch.code}</p> : null}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 size={16} className="mr-2" />
                  <span>{organizations.find(o => o.id === branch.organizationId)?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{branch.city}, {branch.country}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      branch.type === 'Headquarters'
                        ? 'bg-purple-100 text-purple-700'
                        : branch.type === 'Regional Office'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {branch.type}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      branch.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {branch.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => handleView(branch)}
                  className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <Eye size={16} />
                  <span>View</span>
                </button>
                <button
                  onClick={() => handleEdit(branch)}
                  className="flex-1 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {filteredBranches.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <GitBranch className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No branches found</p>
        </div>
      )}

      <NGOModal
        open={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        title={modalCopy.title}
        subtitle={modalCopy.subtitle}
        onSave={handleSave}
        saving={saving}
        saveLabel="Save Branch"
        maxWidth="4xl"
      >
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              Branch details
            </h3>
            <NGOFormGrid>
              <NGOFormField label="Branch Name" required>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={NGO_INPUT_CLASS}
                  placeholder="Enter branch name"
                />
              </NGOFormField>

              {modalMode !== 'add' ? (
                <NGOFormField label="Branch Code">
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="Enter branch code"
                  />
                </NGOFormField>
              ) : null}

              <NGOFormField label="Branch Type" required>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={NGO_INPUT_CLASS}
                >
                  <option>Headquarters</option>
                  <option>Regional Office</option>
                  <option>Field Office</option>
                  <option>Sub-Office</option>
                </select>
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
                  <option>Closed</option>
                </select>
              </NGOFormField>

              <NGOFormField
                label="Established Date"
                hint="Date this branch location opened"
                colSpan={modalMode === 'add' ? 1 : 2}
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
            </NGOFormGrid>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
              Location
            </h3>
            <NGOFormGrid>
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

              <NGOFormField label="Address" required colSpan={2}>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={modalMode === 'view'}
                  className={NGO_INPUT_CLASS}
                  placeholder="Enter full address"
                />
              </NGOFormField>
            </NGOFormGrid>
          </section>

          {modalMode !== 'add' ? (
            <section>
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                Contact (optional)
              </h3>
              <NGOFormGrid>
                <NGOFormField label="Branch Manager">
                  <input
                    type="text"
                    value={formData.manager || ''}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="Enter manager name"
                  />
                </NGOFormField>
                <NGOFormField label="Email">
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="Enter email"
                  />
                </NGOFormField>
                <NGOFormField label="Phone" colSpan={2}>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={modalMode === 'view'}
                    className={NGO_INPUT_CLASS}
                    placeholder="Enter phone number"
                  />
                </NGOFormField>
              </NGOFormGrid>
            </section>
          ) : null}
        </div>
      </NGOModal>
    </div>
  );
}
