import React from 'react'
import Card from '@/components/ui/Card'

interface Tip {
  text: string
  color: string
}

interface LearningTipsProps {
  tips?: Tip[]
}

export function LearningTips({
  tips = [
    { text: "Ask specific questions about concepts you don't understand", color: 'bg-blue-500' },
    { text: 'Use voice input for more natural conversations', color: 'bg-purple-500' },
    { text: 'Review highlighted sections for key takeaways', color: 'bg-green-500' },
  ],
}: LearningTipsProps) {
  return (
    <Card variant="default" padding="lg">
      <h3 className="font-semibold text-gray-900 mb-3">💡 Learning Tips</h3>
      <div className="space-y-3 text-sm">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className={`w-1.5 h-1.5 ${tip.color} rounded-full flex-shrink-0 mt-2`}></div>
            <p className="text-gray-600">{tip.text}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
