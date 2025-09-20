import React from 'react'
import { Clock, ChevronRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import { ActivityItem } from './ActivityItem'
import { LearningStats } from './LearningStats'
import { LearningTips } from './LearningTips'

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

export function RecentActivity({ documents, className = '' }: RecentActivityProps) {
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

  const getRecentActivities = () => {
    const activities = documents.slice(0, 5).map((doc) => ({
      id: doc.id,
      type: 'upload' as const,
      title: `Uploaded ${truncateFileName(doc.originalName)}`,
      createdAt: doc.createdAt,
      document: doc,
    }))

    const chatActivities = documents.slice(0, 2).map((doc) => ({
      id: `chat-${doc.id}`,
      type: 'chat' as const,
      title: `Started chat session`,
      subtitle: truncateFileName(doc.originalName),
      createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      document: doc,
    }))

    return [...activities, ...chatActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }

  const activities = getRecentActivities()

  return (
    <div className={className}>
      <Card variant="default" padding="none">
        <RecentActivityHeader />
        <RecentActivityList activities={activities} formatTimeAgo={formatTimeAgo} />
        <RecentActivityFooter hasActivities={activities.length > 0} />
      </Card>

      <div className="mt-6">
        <LearningStats documentCount={documents.length} />
      </div>
      <div className="mt-6">
        <LearningTips />
      </div>
    </div>
  )
}

function RecentActivityHeader() {
  return (
    <div className="p-6 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

function RecentActivityList({
  activities,
  formatTimeAgo,
}: {
  activities: any[]
  formatTimeAgo: (date: string) => string
}) {
  return (
    <div className="divide-y divide-gray-100">
      {activities.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} formatTimeAgo={formatTimeAgo} />
        ))
      )}
    </div>
  )
}

function RecentActivityFooter({ hasActivities }: { hasActivities: boolean }) {
  if (!hasActivities) return null

  return (
    <div className="p-4 bg-gray-50 border-t border-gray-100">
      <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
        View Activity History
      </button>
    </div>
  )
}
