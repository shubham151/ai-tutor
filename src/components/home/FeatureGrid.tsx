'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { FeatureCard } from './FeatureCard'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  colorGradient: string
}

interface FeaturesGridProps {
  features: Feature[]
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
  return (
    <div className="py-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            colorGradient={feature.colorGradient}
            delay={0.4 + index * 0.1}
          />
        ))}
      </motion.div>
    </div>
  )
}
