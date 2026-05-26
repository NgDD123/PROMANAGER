import React from 'react';
import { BarChart3, Download } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and view various reports</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0">
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Reports & Analytics</h3>
        <p className="text-gray-500">Reports interface coming soon</p>
      </div>
    </div>
  );
}
