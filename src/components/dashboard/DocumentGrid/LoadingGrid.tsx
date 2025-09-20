import React from 'react'

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
