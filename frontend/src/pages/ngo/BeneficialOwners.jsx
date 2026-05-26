import React from 'react';
import { Shield } from 'lucide-react';

export default function BeneficialOwners() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Beneficial Owners</h1>
        <p className="text-gray-600 mt-1">KYC, governance control, and transparency register</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Shield className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-500">Beneficial owners register coming soon</p>
      </div>
    </div>
  );
}
