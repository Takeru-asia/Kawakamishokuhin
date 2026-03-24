export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* KPI skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-7 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Chart + Table skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm">
          <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-56 bg-gray-100 rounded" />
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="h-4 w-36 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
