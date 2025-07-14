'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import ChatArea from '@/components/dashboard/ChatArea'
import UserList from '@/components/dashboard/UserList'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState({})
  
  const { sendMessage, lastMessage, connectionStatus } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
  )

  useEffect(() => {
    // Check authentication
    const userData = sessionStorage.getItem('user')
    if (!userData) {
      router.push('/auth')
      return
    }
    
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    
    // Mock users data
    setUsers([
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'online',
        lastSeen: new Date(),
        unreadCount: 2
      },
      {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        status: 'away',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        unreadCount: 0
      },
      {
        id: 3,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        status: 'offline',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 5
      }
    ])
    
    // Mock messages
    setMessages({
      1: [
        {
          id: 1,
          senderId: 1,
          content: 'Hey! How are you doing?',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: 'text'
        },
        {
          id: 2,
          senderId: parsedUser.id,
          content: 'I\'m good, thanks! How about you?',
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          type: 'text'
        }
      ]
    })
  }, [router])

  const handleChatSelect = (chatUser) => {
    setActiveChat(chatUser)
  }

  const handleSendMessage = (content, type = 'text') => {
    if (!activeChat || !user) return

    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      content,
      timestamp: new Date(),
      type
    }

    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
    }))

    // Send via WebSocket
    sendMessage({
      type: 'message',
      to: activeChat.id,
      from: user.id,
      message: newMessage
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 to-blue-50">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className={`${sidebarOpen ? 'w-80' : 'w-20'} transition-all duration-300`}
      >
        <Sidebar 
          user={user} 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          connectionStatus={connectionStatus}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex-1 flex"
      >
        <div className="w-80 border-r border-slate-200 bg-white/50 backdrop-blur-sm">
          <UserList 
            users={users}
            activeChat={activeChat}
            onChatSelect={handleChatSelect}
            messages={messages}
          />
        </div>

        <div className="flex-1">
          <ChatArea 
            activeChat={activeChat}
            messages={messages[activeChat?.id] || []}
            currentUser={user}
            onSendMessage={handleSendMessage}
          />
        </div>
      </motion.div>
    </div>
  )
}