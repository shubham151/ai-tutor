// components/dashboard/RecentActivity.tsx
import React from 'react'
import { FileText, MessageSquare, Clock, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'

interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
  lastAccessed?: string
}

interface RecentActivityProps {
  documents: Document[]
  className?: string
}

const RecentActivity = ({ documents, className = '' }: RecentActivityProps) => {
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      return `${diffDays}d ago`
    }
  }

  const truncateFileName = (name: string, maxLength: number = 25): string => {
    if (name.length <= maxLength) return name
    const extension = name.split('.').pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
    const truncated = nameWithoutExt.substring(0, maxLength - (extension?.length || 0) - 4)
    return `${truncated}...${extension}`
  }

  // Mock recent activities - in real app, this would come from API
  const getRecentActivities = () => {
    const activities = documents.slice(0, 5).map((doc) => ({
      id: doc.id,
      type: 'upload' as const,
      title: `Uploaded ${truncateFileName(doc.originalName)}`,
      timestamp: doc.createdAt,
      document: doc,
    }))

    // Add some mock chat activities
    const chatActivities = documents.slice(0, 2).map((doc) => ({
      id: `chat-${doc.id}`,
      type: 'chat' as const,
      title: `Started chat session`,
      subtitle: truncateFileName(doc.originalName),
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time within last day
      document: doc,
    }))

    return [...activities, ...chatActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }

  const activities = getRecentActivities()

  return (
    <div className={className}>
      <Card variant="default" padding="none">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="divide-y divide-gray-100">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {/* Activity Icon */}
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5
                    ${
                      activity.type === 'upload'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }
                  `}
                  >
                    {activity.type === 'upload' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    {activity.subtitle && (
                      <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Activity History
            </button>
          </div>
        )}
      </Card>

      {/* Quick Stats Card */}
      <Card variant="default" padding="lg" className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Learning Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Documents uploaded</span>
            <span className="text-sm font-semibold text-gray-900">{documents.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Chat sessions</span>
            <span className="text-sm font-semibold text-gray-900">0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Hours learned</span>
            <span className="text-sm font-semibold text-gray-900">0h</span>
          </div>
        </div>
      </Card>

      {/* Tips Card */}
      <Card variant="default" padding="lg" className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Learning Tips</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
            <p className="text-gray-600">
              Ask specific questions about concepts you don't understand
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
            <p className="text-gray-600">Use voice input for more natural conversations</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
            <p className="text-gray-600">Review highlighted sections for key takeaways</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default RecentActivity
