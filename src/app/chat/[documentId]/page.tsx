'use client'

import { use } from 'react'
import PDFChatView from '@/components/pdfChat/PDFChatView'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface PageProps {
  params: Promise<{ documentId: string }>
}

export default function ChatPage({ params }: PageProps) {
  const { documentId } = use(params)
  console.log(documentId)
  return (
    <ProtectedRoute>
      <PDFChatView documentId={documentId} />
    </ProtectedRoute>
  )
}
