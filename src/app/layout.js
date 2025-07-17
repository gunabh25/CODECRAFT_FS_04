import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import { ChatProvider } from '@/contexts/ChatContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationSystem } from '@/components/notifications/NotificationSystem'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Analytics } from '@/utils/analytics'

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
  keywords: 'chat, messaging, real-time, websocket, nextjs',
  authors: [{ name: 'ChatFlow Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'ChatFlow - Real-time Messaging',
    description: 'Connect instantly with friends and colleagues',
    url: 'https://chatflow.com',
    siteName: 'ChatFlow',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ChatFlow Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatFlow - Real-time Messaging',
    description: 'Connect instantly with friends and colleagues',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.chatflow.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="light-content" />
        <meta name="apple-mobile-web-app-title" content="ChatFlow" />
        <meta name="application-name" content="ChatFlow" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="theme-color" content="#3B82F6" />
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
              {/* Background Effects */}
              <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full">
                  {/* Gradient Orbs */}
                  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
                  <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-2000" />
                  
                  {/* Floating Particles */}
                  <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-300" />
                  <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-indigo-400/40 rounded-full animate-bounce delay-700" />
                  <div className="absolute bottom-1/3 left-2/3 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce delay-1100" />
                  
                  {/* Grid Pattern */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf6,transparent_1px),linear-gradient(to_bottom,#8b5cf6,transparent_1px)] bg-[size:64px_64px] opacity-[0.03]" />
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 min-h-screen flex flex-col">
                {/* Skip to main content for accessibility */}
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Skip to main content
                </a>

                {/* Progressive Web App Install Prompt */}
                <div id="pwa-install-prompt" className="hidden" />

                {/* Main Application Content */}
                <main 
                  id="main-content" 
                  className="flex-1 flex flex-col relative"
                  role="main"
                  aria-label="Main application content"
                >
                  {children}
                </main>

                {/* Global Notification System */}
                <NotificationSystem />

                {/* Loading States Container */}
                <div id="loading-portal" className="fixed inset-0 z-50 pointer-events-none" />

                {/* Modal Portal */}
                <div id="modal-portal" className="fixed inset-0 z-40 pointer-events-none" />

                {/* Tooltip Portal */}
                <div id="tooltip-portal" className="fixed inset-0 z-30 pointer-events-none" />
              </div>

              {/* Development Tools (only in development) */}
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

              {/* Analytics */}
              <Analytics />

              {/* Service Worker Registration */}
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    if ('serviceWorker' in navigator) {
                      window.addEventListener('load', function() {
                        navigator.serviceWorker.register('/sw.js')
                          .then(function(registration) {
                            console.log('SW registered: ', registration);
                          })
                          .catch(function(registrationError) {
                            console.log('SW registration failed: ', registrationError);
                          });
                      });
                    }
                  `,
                }}
              />

              {/* Preload Critical Resources */}
              <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="" />
              <link rel="preload" href="/fonts/poppins-var.woff2" as="font" type="font/woff2" crossOrigin="" />
              
              {/* DNS Prefetch for WebSocket */}
              <link rel="dns-prefetch" href="wss://ws.chatflow.com" />
              
              {/* Prefetch Common Routes */}
              <link rel="prefetch" href="/dashboard" />
              <link rel="prefetch" href="/settings" />
            </ChatProvider>
          </ThemeProvider>
        </ErrorBoundary>

        {/* Critical CSS for First Paint */}
        <style jsx global>{`
          /* Critical above-the-fold styles */
          body {
            font-feature-settings: 'rlig' 1, 'calt' 1;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          
          /* Improve scrolling performance */
          * {
            scroll-behavior: smooth;
          }
          
          /* Optimize for mobile */
          @media (max-width: 768px) {
            body {
              -webkit-text-size-adjust: 100%;
              -webkit-tap-highlight-color: transparent;
            }
          }
          
          /* Custom scrollbar for webkit browsers */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          
          /* Focus styles for accessibility */
          :focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
          }
          
          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </body>
    </html>
  )
}