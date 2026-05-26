import React from 'react';
import { Box } from 'lucide-react';

export default function ServiceControl() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Service Control</h1>
        <p className="text-gray-600 mt-1">Enable modules and configure service permissions</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Box className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Service control center coming soon</p>
      </div>
    </div>
  );
}
