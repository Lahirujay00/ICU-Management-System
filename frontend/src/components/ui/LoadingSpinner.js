export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-6 text-xl text-gray-600">Loading ICU Management System...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we prepare your dashboard</p>
      </div>
    </div>
  )
} 