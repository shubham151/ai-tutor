import React from 'react'
import { FileText, MessageSquare, ChevronRight } from 'lucide-react'

interface Document {
  id: string
  filename: string
  originalName: string
  fileUrl: string
  pageCount: number
  createdAt: string
  lastAccessed?: string
}

interface Activity {
  id: string
  type: 'upload' | 'chat'
  title: string
  subtitle?: string
  createdAt: string
  document: Document
}

interface ActivityItemProps {
  activity: Activity
  formatTimeAgo: (date: string) => string
}

export function ActivityItem({ activity, formatTimeAgo }: ActivityItemProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <ActivityIcon type={activity.type} />
        <ActivityDetails activity={activity} formatTimeAgo={formatTimeAgo} />
        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </div>
  )
}

function ActivityIcon({ type }: { type: 'upload' | 'chat' }) {
  const iconClass = type === 'upload' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'

  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${iconClass}`}
    >
      {type === 'upload' ? <FileText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
    </div>
  )
}

function ActivityDetails({
  activity,
  formatTimeAgo,
}: {
  activity: Activity
  formatTimeAgo: (date: string) => string
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
      {activity.type === 'chat' && activity.subtitle && (
        <p className="text-xs text-gray-500 truncate">{activity.subtitle}</p>
      )}
      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(activity.createdAt)}</p>
    </div>
  )
}
