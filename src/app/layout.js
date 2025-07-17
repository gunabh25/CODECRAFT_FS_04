'use client'

import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import { ChatProvider } from '@/contexts/ChatContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationSystem } from '@/components/notifications/NotificationSystem'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import analytics from '@/utils/analytics'
import { useEffect } from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'ChatFlow - Real-time Messaging',
  description: 'Advanced real-time chat application with WebSocket technology',
}

export default function RootLayout({ children }) {
  useEffect(() => {
    analytics.initialize()
  }, [])

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`
        ${inter.className} 
        antialiased 
        bg-gradient-to-br 
        from-slate-50 
        via-blue-50 
        to-indigo-50 
        text-slate-900 
        selection:bg-blue-100 
        selection:text-blue-900
        overflow-x-hidden
      `}>
        <ErrorBoundary>
          <ThemeProvider>
            <ChatProvider>
              <main id="main-content" className="flex-1 flex flex-col relative">
                {children}
              </main>

              <NotificationSystem />

              <div id="loading-portal" className="fixed inset-0 z-50 pointer-events-none" />
              <div id="modal-portal" className="fixed inset-0 z-40 pointer-events-none" />
              <div id="tooltip-portal" className="fixed inset-0 z-30 pointer-events-none" />

              {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 left-4 z-50">
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 text-xs text-yellow-800">
                    <div>Dev Mode Active</div>
                    <div className="text-yellow-600">
                      WebSocket: <span id="ws-status" className="font-mono">Connecting...</span>
                    </div>
                  </div>
                </div>
              )}
            </ChatProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
