'use client'

import Link from 'next/link'
import { motion } from 'framer-motion' // normal import works now
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import { BookOpen, MessageSquare, Mic, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-macos-background via-blue-50 to-macos-background">
      {/* Navigation */}
      <nav className="backdrop-blur-macos bg-white/80 border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-macos-accent to-blue-600 rounded-lg"></div>
              <h1 className="text-xl font-semibold text-macos-text font-sf">AI Tutor</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="w-full h-full block">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full h-full block">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-6"
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-macos-text font-sf leading-tight">
              Learn Smarter with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-macos-accent to-blue-600">
                {' '}
                AI
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-macos-textSecondary font-sf">
              Upload your PDF documents and chat with our AI tutor for interactive, personalized
              learning experiences that adapt to your needs.
            </p>
            <div className="flex justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-4 w-full">
                  Start Learning
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: BookOpen,
                title: 'Interactive Reading',
                description: 'Chat with your PDFs and get instant answers to your questions.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: MessageSquare,
                title: 'Smart Highlighting',
                description: 'AI automatically highlights relevant sections as you learn.',
                color: 'from-green-500 to-green-600',
              },
              {
                icon: Mic,
                title: 'Voice Support',
                description: 'Use voice commands for natural, hands-free interaction.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: Zap,
                title: 'Instant Insights',
                description: 'Get immediate explanations and contextual information.',
                color: 'from-orange-500 to-orange-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <Card className="glass border-white/20 hover:shadow-macos-lg transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center space-y-4">
                    <div
                      className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-macos-text font-sf">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-macos-textSecondary font-sf">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center py-20"
        >
          <Card className="glass border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold text-macos-text font-sf mb-4">
                Ready to transform your learning?
              </h3>
              <p className="text-macos-textSecondary font-sf mb-8">
                Join thousands of students already learning smarter with AI-powered tutoring.
              </p>
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-4 w-full">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
