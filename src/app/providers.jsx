'use client'

import { ChatProvider } from '@/contexts/ChatContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationSystem } from '@/components/notifications/NotificationSystem'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import analytics from '@/utils/analytics'
import { useEffect } from 'react'


export default function Providers({ children }) {
  useEffect(() => {
    analytics.initialize()
  }, [])

  return (
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
  )
}
