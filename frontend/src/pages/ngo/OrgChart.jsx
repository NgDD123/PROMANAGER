import React from 'react';
import { Network } from 'lucide-react';

export default function OrgChart() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Org Chart</h1>
        <p className="text-gray-600 mt-1">Visual hierarchy across organization, branches, and departments</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Network className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Org chart view coming soon</p>
      </div>
    </div>
  );
}
