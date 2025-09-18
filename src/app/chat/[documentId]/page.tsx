'use client'

import { use } from 'react'
import ChatView from '@/components/chat/ChatView'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface PageProps {
  params: Promise<{ documentId: string }>
}

export default function ChatPage({ params }: PageProps) {
  const { documentId } = use(params)

  return (
    <ProtectedRoute>
      <ChatView documentId={documentId} />
    </ProtectedRoute>
  )
}
