'use client'

import React from 'react'
import { Send, Mic, MicOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import ChatUtils from '@/utils/ChatUtil'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  placeholder?: string
  helperText?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onKeyPress,
  isLoading,
  isRecording,
  onStartRecording,
  onStopRecording,
  placeholder = 'Ask a question about the document...',
  helperText = `Try asking: "Explain this concept on page 3" or "What are the key takeaways?"`,
}: ChatInputProps) {
  const textareaRows = ChatUtils.calculateTextareaRows(value)
  const canSubmit = ChatUtils.isValidMessageContent(value) && !isLoading && !isRecording

  const inputPlaceholder = isRecording ? 'Recording...' : placeholder

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-end gap-3">
        <VoiceRecordButton
          isRecording={isRecording}
          isLoading={isLoading}
          onStart={onStartRecording}
          onStop={onStopRecording}
        />

        <MessageTextarea
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          placeholder={inputPlaceholder}
          disabled={isLoading || isRecording}
          rows={textareaRows}
        />

        <SendButton onSubmit={onSubmit} disabled={!canSubmit} />
      </div>

      <ChatHelperText text={helperText} />
    </div>
  )
}

function VoiceRecordButton({
  isRecording,
  isLoading,
  onStart,
  onStop,
}: {
  isRecording: boolean
  isLoading: boolean
  onStart: () => void
  onStop: () => void
}) {
  return (
    <Button
      variant={isRecording ? 'danger' : 'ghost'}
      size="sm"
      onClick={isRecording ? onStop : onStart}
      disabled={isLoading}
      className="flex-shrink-0"
    >
      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </Button>
  )
}

function MessageTextarea({
  value,
  onChange,
  onKeyPress,
  placeholder,
  disabled,
  rows,
}: {
  value: string
  onChange: (value: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  placeholder: string
  disabled: boolean
  rows: number
}) {
  return (
    <div className="flex-1 relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        rows={rows}
      />
    </div>
  )
}

function SendButton({ onSubmit, disabled }: { onSubmit: () => void; disabled: boolean }) {
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onSubmit}
      disabled={disabled}
      className="flex-shrink-0"
    >
      <Send className="w-4 h-4" />
    </Button>
  )
}

function ChatHelperText({ text }: { text: string }) {
  return (
    <div className="mt-3 text-xs text-gray-500">
      <p>{text}</p>
    </div>
  )
}
