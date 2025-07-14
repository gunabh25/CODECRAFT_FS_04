/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { Check, CheckCheck, Clock } from 'lucide-react'
import { useState } from 'react'

export default function MessageBubble({ 
  message, 
  isOwn, 
  previousMessage, 
  nextMessage, 
  currentUser, 
  chatPartner,
  isTyping = false,
  onReact = () => {},
  reactions = {}
}) {
  const [showReactions, setShowReactions] = useState(false)
  const emojiList = ['❤️', '😂', '👍', '👀', '😢']

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    else if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    else return date.toLocaleDateString()
  }

  const shouldShowDate = () => {
    if (!previousMessage) return true
    return new Date(message.timestamp).toDateString() !== new Date(previousMessage.timestamp).toDateString()
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
    const statuses = ['sent', 'delivered', 'read']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  const renderStatusIcon = () => {
    const status = getMessageStatus()
    switch (status) {
      case 'sent': return <Clock className="w-3 h-3 text-slate-400" />
      case 'delivered': return <Check className="w-3 h-3 text-slate-400" />
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />
      default: return null
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <img
            src={message.content}
            alt="Shared image"
            className="max-w-xs rounded-lg cursor-pointer"
            onClick={() => window.open(message.content, '_blank')}
          />
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

  const reactionList = reactions[message.id] || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center space-x-2 mb-2 px-4 text-xs text-slate-500 italic">
          <span>{chatPartner.name} is typing...</span>
          <span className="animate-bounce">...</span>
        </div>
      )}

      {/* Date separator */}
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

        {/* Message container */}
        <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
          {shouldShowName() && !isOwn && (
            <span className="text-xs font-medium text-slate-600 mb-1 px-1">
              {chatPartner.name}
            </span>
          )}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-xl ${isOwn ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {renderMessageContent()}

            {/* Emoji reactions below message */}
            {reactionList.length > 0 && (
              <div className="mt-1 flex space-x-1">
                {reactionList.map((emoji, idx) => (
                  <span key={idx} className="text-sm">{emoji}</span>
                ))}
              </div>
            )}

            {/* Emoji selector on hover */}
            {showReactions && (
              <div className={`absolute ${isOwn ? 'right-full mr-2' : 'left-full ml-2'} top-0 z-10 bg-white shadow rounded-full px-2 py-1 flex space-x-1`}>
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(message.id, emoji)}
                    className="hover:scale-110 transition-transform text-sm"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timestamp and status icon */}
          <div className={`flex items-center mt-1 text-xs space-x-1 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <span className="text-slate-500">{formatTime(message.timestamp)}</span>
            {isOwn && renderStatusIcon()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
