'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

interface HeroSectionProps {
  title: string
  subtitle: string
  ctaText?: string
  ctaLink?: string
  highlightWord?: string
}

export function HeroSection({
  title,
  subtitle,
  ctaText = 'Start Learning',
  ctaLink = '/login',
  highlightWord,
}: HeroSectionProps) {
  const renderTitle = () => {
    if (!highlightWord) return title

    const parts = title.split(highlightWord)
    return (
      <>
        {parts[0]}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-macos-accent to-blue-600">
          {highlightWord}
        </span>
        {parts[1]}
      </>
    )
  }

  return (
    <div className="text-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="space-y-6"
      >
        <h2 className="text-5xl sm:text-6xl font-bold text-macos-text font-sf leading-tight">
          {renderTitle()}
        </h2>
        <p className="max-w-2xl mx-auto text-xl text-macos-textSecondary font-sf">{subtitle}</p>
        <div className="flex justify-center">
          <Link href={ctaLink}>
            <Button size="lg" className="text-lg px-8 py-4 w-full">
              {ctaText}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
