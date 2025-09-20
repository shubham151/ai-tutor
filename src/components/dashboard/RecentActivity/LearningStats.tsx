import React from 'react'
import Card from '@/components/ui/Card'

interface LearningStatsProps {
  documentCount: number
  sessionCount?: number
  learningHours?: number
}

export function LearningStats({
  documentCount,
  sessionCount = 0,
  learningHours = 0,
}: LearningStatsProps) {
  const stats = [
    { label: 'Documents uploaded', value: documentCount },
    { label: 'Chat sessions', value: sessionCount },
    { label: 'Hours learned', value: `${learningHours}h` },
  ]

  return (
    <Card variant="default" padding="lg">
      <h3 className="font-semibold text-gray-900 mb-4">Learning Stats</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{stat.label}</span>
            <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
