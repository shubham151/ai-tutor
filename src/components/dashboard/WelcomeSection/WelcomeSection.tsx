import React from 'react'
import { BookOpen, Zap, Brain } from 'lucide-react'
import { GreetingHeader } from './GreetingHeader'
import { StatsCard } from './StatsCard'
import { FeatureHighlights } from './FeatureHighlights'

interface WelcomeSectionProps {
  userName: string
  documentCount: number
  sessionCount?: number
  learningHours?: number
}

export function WelcomeSection({
  userName,
  documentCount,
  sessionCount = 0,
  learningHours = 0,
}: WelcomeSectionProps) {
  const stats = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Documents',
      value: documentCount.toString(),
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: <Brain className="w-5 h-5" />,
      label: 'AI Sessions',
      value: sessionCount.toString(),
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Learning Hours',
      value: learningHours.toString(),
      color: 'text-green-600 bg-green-100',
    },
  ]

  return (
    <div className="text-center space-y-6">
      <GreetingHeader userName={userName} />
      <StatsCard stats={stats} />
      <FeatureHighlights />
    </div>
  )
}
