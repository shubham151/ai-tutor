// app/utils/chat-utils.ts

function formatTime(createdAt: string): string {
  return new Date(createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function createSuggestedQuestions() {
  return [
    { text: "What's this about?", prompt: 'What is this document about?' },
    { text: 'Summarize key points', prompt: 'Summarize the main points' },
    { text: 'Key concepts', prompt: 'Explain the most important concept' },
  ]
}

function calculateTextareaRows(text: string, maxRows = 4): number {
  const lines = text.split('\n').length
  return Math.min(Math.max(lines, 1), maxRows)
}

function shouldAutoScroll(container: HTMLElement): boolean {
  const { scrollTop, scrollHeight, clientHeight } = container
  return scrollTop + clientHeight >= scrollHeight - 10
}

function createMessageId(): string {
  return Date.now().toString()
}

function isValidMessageContent(content: string): boolean {
  return content.trim().length > 0
}

function createDefaultAnnotation(pageNumber: number) {
  return {
    pageNumber,
    x: 0.1,
    y: 0.5,
    width: 0.8,
    height: 0.1,
    type: 'highlight' as const,
    color: '#ffff00',
  }
}

const ChatUtils = {
  formatTime,
  createSuggestedQuestions,
  calculateTextareaRows,
  shouldAutoScroll,
  createMessageId,
  isValidMessageContent,
  createDefaultAnnotation,
}

export default ChatUtils
