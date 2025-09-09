import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src="/logo.png" alt="FreelanceHub" className="h-12 w-auto mx-auto" />
        </div>

        {/* Loading Spinner */}
        <div className="mb-8">
          <LoadingSpinner size="lg" color="green" text="Loading..." />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
          Welcome to FreelanceHub
        </h1>
        <p className="text-gray-600 font-inter">
          Connecting talented freelancers with amazing opportunities
        </p>

        {/* Loading Animation */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
