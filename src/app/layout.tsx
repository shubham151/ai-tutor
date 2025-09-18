import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StudyFetch AI Tutor',
  description: 'AI-powered PDF tutor for interactive learning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-macos-background`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#1d1d1f',
              border: '1px solid #d2d2d7',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, sans-serif',
              boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
