import React from 'react'

interface StatItem {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

interface StatsCardProps {
  stats: StatItem[]
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {stats.map((stat, index) => (
        <StatItemCard key={index} stat={stat} />
      ))}
    </div>
  )
}

function StatItemCard({ stat }: { stat: StatItem }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow min-w-[120px]">
      <div
        className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}
      >
        {stat.icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
      <div className="text-sm text-gray-500">{stat.label}</div>
    </div>
  )
}
