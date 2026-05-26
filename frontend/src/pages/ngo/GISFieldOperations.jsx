import React from 'react';
import { MapPinned, Users, Route, CheckCircle2 } from 'lucide-react';

export default function GISFieldOperations({
  workspace,
  summary,
  branchById,
  fieldSiteById,
  scopedBranches,
  fieldSiteForm,
  setFieldSiteForm,
  fieldVisitForm,
  setFieldVisitForm,
  createFieldSite,
  createFieldVisit,
  removeItem,
  statusOptions
}) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Metric icon={MapPinned} label="Mapped Locations" value={summary.mappedLocations} />
        <Metric icon={Users} label="Beneficiaries Mapped" value={summary.beneficiariesMapped.toLocaleString()} />
        <Metric icon={Route} label="Field Visits" value={workspace.fieldVisits.length} />
        <Metric icon={CheckCircle2} label="Active Sites" value={workspace.fieldSites.filter(site => site.status === 'Active').length} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <form onSubmit={createFieldSite} className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-md">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-900">
            <MapPinned className="w-5 h-5 text-emerald-700" />
            Project Location
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Site / Village Name" value={fieldSiteForm.name} onChange={value => setFieldSiteForm({ ...fieldSiteForm, name: value })} required />
            <SelectInput label="Branch" value={fieldSiteForm.branchId} options={scopedBranches.map(branch => ({ label: branch.name, value: branch.id }))} onChange={value => setFieldSiteForm({ ...fieldSiteForm, branchId: value })} required />
            <Input label="Field Officer" value={fieldSiteForm.officer} onChange={value => setFieldSiteForm({ ...fieldSiteForm, officer: value })} />
            <Input label="GPS Coordinates" value={fieldSiteForm.gps} onChange={value => setFieldSiteForm({ ...fieldSiteForm, gps: value })} placeholder="11.0840, 39.7430" />
            <Input label="Beneficiaries" type="number" value={fieldSiteForm.beneficiaries} onChange={value => setFieldSiteForm({ ...fieldSiteForm, beneficiaries: value })} />
            <SelectInput label="Status" value={fieldSiteForm.status} options={statusOptions} onChange={value => setFieldSiteForm({ ...fieldSiteForm, status: value })} />
          </div>
          <button className="mt-5 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-lg transition-all">
            <MapPinned className="w-5 h-5" />
            Map Site
          </button>
        </form>

        <form onSubmit={createFieldVisit} className="rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-md">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-900">
            <Route className="w-5 h-5 text-blue-700" />
            Field Visit
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectInput label="Site" value={fieldVisitForm.siteId} options={workspace.fieldSites.map(site => ({ label: site.name, value: site.id }))} onChange={value => setFieldVisitForm({ ...fieldVisitForm, siteId: value })} required />
            <Input label="Date" type="date" value={fieldVisitForm.date} onChange={value => setFieldVisitForm({ ...fieldVisitForm, date: value })} required />
            <Input label="Officer" value={fieldVisitForm.officer} onChange={value => setFieldVisitForm({ ...fieldVisitForm, officer: value })} />
            <Input label="Purpose" value={fieldVisitForm.purpose} onChange={value => setFieldVisitForm({ ...fieldVisitForm, purpose: value })} />
            <div className="md:col-span-2">
              <SelectInput label="Outcome" value={fieldVisitForm.outcome} options={['Scheduled', 'Completed', 'Follow-up Required']} onChange={value => setFieldVisitForm({ ...fieldVisitForm, outcome: value })} />
            </div>
          </div>
          <button className="mt-5 w-full inline-flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg transition-all">
            <Route className="w-5 h-5" />
            Record Visit
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-base sm:text-xl font-bold flex items-center gap-2">
            <MapPinned className="w-6 h-6 text-emerald-700" />
            GIS Project Locations
          </h4>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            {workspace.fieldSites.length} sites mapped
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Site</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Branch</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">GPS</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Beneficiaries</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Status</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {workspace.fieldSites.map(site => (
                <tr key={site.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900">{site.name}</td>
                  <td className="px-5 py-4 text-gray-700">{branchById[site.branchId]?.name || 'Unassigned'}</td>
                  <td className="px-5 py-4">
                    {site.gps ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.gps)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <MapPinned className="w-4 h-4" />
                        {site.gps}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Not mapped</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">
                      <Users className="w-3.5 h-3.5" />
                      {Number(site.beneficiaries || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                      site.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                      site.status === 'Planning' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => removeItem('fieldSites', site.id, `Site ${site.name}`)}
                      className="text-red-600 hover:text-red-800 font-bold text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {workspace.fieldSites.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                    <MapPinned className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold">No field sites mapped yet</p>
                    <p className="text-sm mt-1">Add your first project location above to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-base sm:text-xl font-bold flex items-center gap-2">
            <Route className="w-6 h-6 text-blue-700" />
            Field Visit Log
          </h4>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800">
            {workspace.fieldVisits.length} visits recorded
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Site</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Date</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Officer</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Purpose</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Outcome</th>
                <th className="px-5 py-4 text-left font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {workspace.fieldVisits.map(visit => (
                <tr key={visit.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-gray-900">{fieldSiteById[visit.siteId]?.name || 'Unknown site'}</td>
                  <td className="px-5 py-4 text-gray-700">{visit.date}</td>
                  <td className="px-5 py-4 text-gray-700">{visit.officer}</td>
                  <td className="px-5 py-4 text-gray-700">{visit.purpose || 'Not specified'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                      visit.outcome === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      visit.outcome === 'Follow-up Required' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {visit.outcome}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => removeItem('fieldVisits', visit.id, 'Field visit')}
                      className="text-red-600 hover:text-red-800 font-bold text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {workspace.fieldVisits.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-500">
                    <Route className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-semibold">No field visits recorded yet</p>
                    <p className="text-sm mt-1">Log your first visit above to track field operations</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-md">
        <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-lg">
          <CheckCircle2 className="w-6 h-6" />
          Professional GIS Integration
        </h4>
        <p className="mt-3 text-sm text-emerald-800 leading-relaxed">
          GPS coordinates link directly to Google Maps for field navigation. Track beneficiaries, field officers, and visit outcomes across all project sites. Export location data for donor reports and impact assessments.
        </p>
      </div>
    </>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:border-emerald-300 transition-colors">
      <Icon className="w-6 h-6 text-emerald-700 mb-3" />
      <p className="text-xl sm:text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-600 mt-2 font-semibold">{label}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
      />
    </label>
  );
}

function SelectInput({ label, value, options, onChange, required = false }) {
  const normalized = options.map(option => typeof option === 'string' ? { label: option, value: option } : option);
  return (
    <label className="block">
      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{label}</span>
      <select
        value={value}
        required={required}
        onChange={event => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
      >
        <option value="">Select...</option>
        {normalized.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
