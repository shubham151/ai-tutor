// components/dashboard/QuickActions.tsx
import React from 'react'
import { Plus, BookTemplate, HelpCircle, Zap, Users, Settings } from 'lucide-react'
import Card from '@/components/ui/Card'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  action: () => void
}

interface QuickActionsProps {
  onNewDocument: () => void
  onViewTemplates: () => void
  onGetHelp: () => void
  className?: string
}

const QuickActions = ({
  onNewDocument,
  onViewTemplates,
  onGetHelp,
  className = '',
}: QuickActionsProps) => {
  const actions: QuickAction[] = [
    {
      id: 'upload',
      title: 'Upload Document',
      description: 'Add a new PDF to start learning',
      icon: <Plus className="w-5 h-5" />,
      color: 'text-blue-600 bg-blue-100 hover:bg-blue-200',
      action: onNewDocument,
    },
    {
      id: 'templates',
      title: 'Browse Templates',
      description: 'Explore sample documents and use cases',
      icon: <BookTemplate className="w-5 h-5" />,
      color: 'text-purple-600 bg-purple-100 hover:bg-purple-200',
      action: onViewTemplates,
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      description: 'Learn about annotation and chat capabilities',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200',
      action: () => console.log('AI features'),
    },
    {
      id: 'community',
      title: 'Join Community',
      description: 'Connect with other learners and share tips',
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100 hover:bg-green-200',
      action: () => console.log('Community'),
    },
    {
      id: 'help',
      title: 'Get Help',
      description: 'Tutorials and support resources',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'text-orange-600 bg-orange-100 hover:bg-orange-200',
      action: onGetHelp,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Customize your learning experience',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-gray-600 bg-gray-100 hover:bg-gray-200',
      action: () => console.log('Settings'),
    },
  ]

  return (
    <Card variant="default" padding="lg" className={className}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
        <p className="text-gray-600">Everything you need to get started</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md text-left"
          >
            <div
              className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3 transition-colors group-hover:scale-110 transform duration-200`}
            >
              {action.icon}
            </div>
            <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
              {action.title}
            </h3>
            <p className="text-xs text-gray-500 leading-tight">{action.description}</p>
          </button>
        ))}
      </div>
    </Card>
  )
}

export default QuickActions
