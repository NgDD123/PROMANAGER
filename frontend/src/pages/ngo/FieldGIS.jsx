import React from 'react';
import { MapPinned } from 'lucide-react';

export default function FieldGIS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Field GIS</h1>
        <p className="text-gray-600 mt-1">Mapped locations, field sites, and visit tracking</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <MapPinned className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Field GIS operations coming soon</p>
      </div>
    </div>
  );
}
