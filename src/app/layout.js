'use client';

import { useEffect, useState } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { SocketProvider } from '@/components/providers/socket-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ModalProvider } from '@/components/providers/modal-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { SessionProvider } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { SpeedInsights } from '@vercel/speed-insights/next';
import analytics from '@/lib/analytics';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId');
    if (uid) setUserId(uid);
  }, []);

  useEffect(() => {
    if (!analytics.isInitialized) {
      analytics.initialize(userId);
    }

    const socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      console.log('📡 WebSocket Connected');
      analytics.track('WebSocket Connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            analytics.trackMessageReceived(data);
            break;
          case 'notification':
            analytics.trackNotificationShown(data);
            break;
          default:
            analytics.track('WebSocket Event', { data });
        }
      } catch (err) {
        console.error('❌ WebSocket Message Error:', err);
        analytics.trackErrorOccurred(err);
      }
    };

    socket.onerror = (err) => {
      console.error('❌ WebSocket Error:', err);
      analytics.trackErrorOccurred(err);
    };

    socket.onclose = () => {
      console.log('📴 WebSocket Disconnected');
      analytics.track('WebSocket Disconnected');
    };

    return () => socket.close();
  }, [userId]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <SpeedInsights />
        <SessionProvider>
          <SocketProvider>
            <QueryProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ModalProvider />
                <Toaster />
                {children}
              </ThemeProvider>
            </QueryProvider>
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
