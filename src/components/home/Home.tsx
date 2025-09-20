'use client'

import { BookOpen, MessageSquare, Mic, Zap } from 'lucide-react'
import { Navigation } from './Navigation'
import { HeroSection } from './HeroSection'
import { FeaturesGrid } from './FeatureGrid'
import { CTASection } from './CTASection'
import { Footer } from './Footer'

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Reading',
    description: 'Chat with your PDFs and get instant answers to your questions.',
    colorGradient: 'from-blue-500 to-blue-600',
  },
  {
    icon: MessageSquare,
    title: 'Smart Highlighting',
    description: 'AI automatically highlights relevant sections as you learn.',
    colorGradient: 'from-green-500 to-green-600',
  },
  {
    icon: Mic,
    title: 'Voice Support',
    description: 'Use voice commands for natural, hands-free interaction.',
    colorGradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Get immediate explanations and contextual information.',
    colorGradient: 'from-orange-500 to-orange-600',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-macos-background via-blue-50 to-macos-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection
          title="Learn Smarter with AI"
          subtitle="Upload your PDF documents and chat with our AI tutor for interactive, personalized learning experiences that adapt to your needs."
          highlightWord="AI"
        />

        <FeaturesGrid features={features} />

        <CTASection
          title="Ready to transform your learning?"
          description="Join thousands of students already learning smarter with AI-powered tutoring."
        />

        <Footer />
      </main>
    </div>
  )
}
