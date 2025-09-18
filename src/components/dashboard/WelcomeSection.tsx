// components/dashboard/WelcomeSection.tsx
import React from 'react'
import { BookOpen, Zap, Brain } from 'lucide-react'

interface WelcomeSectionProps {
  userName: string
  documentCount: number
}

const WelcomeSection = ({ userName, documentCount }: WelcomeSectionProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

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
      value: '0', // TODO: Add actual chat session count
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      label: 'Learning Hours',
      value: '0', // TODO: Add actual learning time
      color: 'text-green-600 bg-green-100',
    },
  ]

  return (
    <div className="text-center space-y-6">
      {/* Main Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ready to dive into your documents? Upload a PDF and start learning with our AI tutor.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow min-w-[120px]"
          >
            <div
              className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}
            >
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Interactive PDF Annotations
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Voice & Text Chat
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Personalized Learning
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSection
