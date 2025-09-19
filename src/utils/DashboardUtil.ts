// app/utils/dashboard-utils.ts

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Today'
  if (diffDays === 2) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays - 1} days ago`
  return date.toLocaleDateString()
}

function formatTimeAgo(dateString: string): string {
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

function truncateFileName(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name
  const extension = name.split('.').pop()
  const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
  const truncated = nameWithoutExt.substring(0, maxLength - (extension?.length || 0) - 4)
  return `${truncated}...${extension}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getUserDisplayName(email: string): string {
  return email.split('@')[0]
}

function createMockActivities(documents: any[]) {
  const activities = documents.slice(0, 5).map((doc) => ({
    id: doc.id,
    type: 'upload' as const,
    title: `Uploaded ${truncateFileName(doc.originalName, 25)}`,
    timestamp: doc.createdAt,
    document: doc,
  }))

  const chatActivities = documents.slice(0, 2).map((doc) => ({
    id: `chat-${doc.id}`,
    type: 'chat' as const,
    title: `Started chat session`,
    subtitle: truncateFileName(doc.originalName, 25),
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    document: doc,
  }))

  return [...activities, ...chatActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
}

function validateFileType(file: File): boolean {
  return file.type === 'application/pdf'
}

function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSize = maxSizeMB * 1024 * 1024
  return file.size <= maxSize
}

function createConfirmMessage(action: string, itemName: string): string {
  return `Are you sure you want to ${action} ${itemName}?`
}

function generateUploadTips(): string[] {
  return [
    'Upload textbooks, research papers, or study materials',
    'Clear, high-quality PDFs work best with our AI',
    'Try asking questions about specific sections or concepts',
  ]
}

function generateLearningTips(): Array<{ text: string; color: string }> {
  return [
    {
      text: "Ask specific questions about concepts you don't understand",
      color: 'bg-blue-500',
    },
    {
      text: 'Use voice input for more natural conversations',
      color: 'bg-purple-500',
    },
    {
      text: 'Review highlighted sections for key takeaways',
      color: 'bg-green-500',
    },
  ]
}

const DashboardUtils = {
  formatDate,
  formatTimeAgo,
  truncateFileName,
  formatFileSize,
  getGreeting,
  getUserDisplayName,
  createMockActivities,
  validateFileType,
  validateFileSize,
  createConfirmMessage,
  generateUploadTips,
  generateLearningTips,
}

export default DashboardUtils
