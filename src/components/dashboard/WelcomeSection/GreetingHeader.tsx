import React from 'react'

interface GreetingHeaderProps {
  userName: string
  description?: string
}

export function GreetingHeader({
  userName,
  description = 'Ready to dive into your documents? Upload a PDF and start learning with our AI tutor.',
}: GreetingHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {getGreeting()}, {userName}! 👋
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
    </div>
  )
}
