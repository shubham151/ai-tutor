import React from 'react'

interface Feature {
  label: string
  color: string
}

interface FeatureHighlightsProps {
  features?: Feature[]
  className?: string
}

export function FeatureHighlights({
  features = [
    { label: 'Interactive PDF Annotations', color: 'bg-blue-500' },
    { label: 'Voice & Text Chat', color: 'bg-purple-500' },
    { label: 'Personalized Learning', color: 'bg-green-500' },
  ],
  className = '',
}: FeatureHighlightsProps) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 ${className}`}
    >
      <div className="flex flex-wrap justify-center gap-8 text-sm">
        {features.map((feature, index) => (
          <FeatureItem key={index} feature={feature} />
        ))}
      </div>
    </div>
  )
}

function FeatureItem({ feature }: { feature: Feature }) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <div className={`w-2 h-2 ${feature.color} rounded-full`}></div>
      {feature.label}
    </div>
  )
}
