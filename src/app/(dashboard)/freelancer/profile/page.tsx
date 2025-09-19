'use client';

import DashboardLayout from '../../../../components/layouts/DashboardLayout';

export default function FreelancerProfilePage() {
  return (
    <DashboardLayout userRole="freelancer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Edit Profile
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-full bg-gray-200"></div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Name</h2>
                <p className="text-gray-600">Professional Title</p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">No reviews yet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
            <div className="text-center py-8">
              <p className="text-gray-500">No portfolio items yet</p>
              <button className="mt-3 text-indigo-600 hover:text-indigo-700">Add Portfolio Item</button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
            <div className="text-center py-8">
              <p className="text-gray-500">No skills added yet</p>
              <button className="mt-3 text-indigo-600 hover:text-indigo-700">Add Skills</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}