// src/app/layout.js
'use client'

import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import Providers from './providers'
import { useEffect } from 'react'
import analytics from '@/utils/analytics'

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
    // Initialize analytics client-side
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
