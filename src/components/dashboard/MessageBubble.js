/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { Check, CheckCheck, Clock } from 'lucide-react'

export default function MessageBubble({ 
  message, 
  isOwn, 
  previousMessage, 
  nextMessage, 
  currentUser, 
  chatPartner 
}) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const shouldShowDate = () => {
    if (!previousMessage) return true
    const currentDate = new Date(message.timestamp).toDateString()
    const previousDate = new Date(previousMessage.timestamp).toDateString()
    return currentDate !== previousDate
  }

  const shouldShowAvatar = () => {
    if (isOwn) return false
    if (!nextMessage) return true
    return nextMessage.senderId !== message.senderId
  }

  const shouldShowName = () => {
    if (isOwn) return false
    if (!previousMessage) return true
    return previousMessage.senderId !== message.senderId
  }

  const getMessageStatus = () => {
    // Mock status for demo
    const statuses = ['sent', 'delivered', 'read']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={message.content}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => window.open(message.content, '_blank')}
            />
          </div>
        )
      case 'file':
        return (
          <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">📎</span>
            </div>
            <div>
              <p className="font-medium text-sm">{message.content}</p>
              <p className="text-xs text-slate-500">Click to download</p>
            </div>
          </div>
        )
      default:
        return (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )
    }
  }

  const renderStatusIcon = () => {
    const status = getMessageStatus()
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-slate-400" />
      case 'delivered':
        return <Check className="w-3 h-3 text-slate-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Date Separator */}
      {shouldShowDate() && (
        <div className="flex items-center justify-center my-4">
          <div className="bg-slate-100 rounded-full px-3 py-1">
            <span className="text-xs font-medium text-slate-600">
              {formatDate(message.timestamp)}
            </span>
          </div>
        </div>
      )}

      <div className={`flex items-end space-x-2 mb-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        {shouldShowAvatar() && !isOwn && (
          <motion.img
            src={chatPartner.avatar}
            alt={chatPartner.name}
            className="w-8 h-8 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          />
        )}
        
        {/* Message Container */}
        <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name */}
          {shouldShowName() && !isOwn && (
            <span className="text-xs font-medium text-slate-600 mb-1 px-1">
              {chatPartner.name}
            </span>
          )}

          {/* Message Bubble */}
          <div className={`px-4 py-2 rounded-xl ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
            {renderMessageContent()}
          </div>

          {/* Timestamp & Status */}
          <div className={`flex items-center mt-1 text-xs space-x-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-slate-500">{formatTime(message.timestamp)}</span>
            {isOwn && renderStatusIcon()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
