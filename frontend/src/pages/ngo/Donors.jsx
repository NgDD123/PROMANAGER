import React from 'react';
import { HandHeart, Plus } from 'lucide-react';

export default function Donors() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Donors & Grants</h1>
          <p className="text-gray-600 mt-1">Manage donors, grants, and funding sources</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0">
          <Plus size={20} />
          <span>Add Donor</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <HandHeart className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Donors & Grants Management</h3>
        <p className="text-gray-500">Donor and grant management interface coming soon</p>
      </div>
    </div>
  );
}
