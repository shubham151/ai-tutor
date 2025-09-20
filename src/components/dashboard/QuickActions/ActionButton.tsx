import React from 'react'

interface ActionButtonProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
  onClick: () => void
}

export function ActionButton({ title, description, icon, color, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md text-left"
    >
      <div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3 transition-colors group-hover:scale-110 transform duration-200`}
      >
        {icon}
      </div>
      <h3 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-tight">{description}</p>
    </button>
  )
}
