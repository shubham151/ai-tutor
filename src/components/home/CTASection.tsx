'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'

interface CTASectionProps {
  title: string
  description: string
  ctaText?: string
  ctaLink?: string
}

export function CTASection({
  title,
  description,
  ctaText = 'Get Started Free',
  ctaLink = '/login',
}: CTASectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="text-center py-20"
    >
      <Card className="glass border-white/20 max-w-2xl mx-auto">
        <CardContent className="p-12">
          <h3 className="text-3xl font-bold text-macos-text font-sf mb-4">{title}</h3>
          <p className="text-macos-textSecondary font-sf mb-8">{description}</p>
          <Link href={ctaLink}>
            <Button size="lg" className="text-lg px-8 py-4 w-full">
              {ctaText}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
