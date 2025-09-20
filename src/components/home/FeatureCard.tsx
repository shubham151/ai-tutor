'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Card, { CardContent } from '@/components/ui/Card'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  colorGradient: string
  delay?: number
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  colorGradient,
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="glass border-white/20 hover:shadow-macos-lg transition-all duration-300 h-full">
        <CardContent className="p-6 text-center space-y-4">
          <div
            className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${colorGradient} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-macos-text font-sf">{title}</h3>
          <p className="text-sm text-macos-textSecondary font-sf">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
