'use client';

import React from 'react';
import { Building, Briefcase, DollarSign, Star, Users } from 'lucide-react';
import { ClientProfileData } from '../../../types/profile';

interface ClientStatsProps {
  clientData: ClientProfileData;
}

export default function ClientStats({ clientData }: ClientStatsProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-blue-600" />
        Company Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600">Jobs Posted</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {clientData.postedJobs}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${clientData.totalSpent.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-gray-600">Rating</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {clientData.rating.toFixed(1)}
          </div>
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(clientData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-gray-600">Reviews</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {clientData.reviewCount}
          </div>
        </div>
      </div>
    </div>
  );
}
