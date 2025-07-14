/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  Info,
  Image,
  File
} from 'lucide-react'
import MessageBubble from './MessageBubble'
import EmojiPicker from './EmojiPicker'

export default function ChatArea({ activeChat, messages, currentUser, onSendMessage }) {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
      setShowEmojiPicker(false)
    }
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          onSendMessage(e.target.result, 'image')
        }
        reader.readAsDataURL(file)
      } else {
        onSendMessage(`File: ${file.name}`, 'file')
      }
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Select a conversation
          </h3>
          <p className="text-slate-600">
            Choose from your existing conversations or start a new one
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <motion.div 
        className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="w-10 h-10 rounded-full"
              />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(activeChat.status)} rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{activeChat.name}</h3>
              <p className="text-sm text-slate-500">
                {activeChat.status === 'online' ? 'Online' : 
                 activeChat.status === 'away' ? 'Away' : 
                 `Last seen ${formatTime(activeChat.lastSeen)}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-5 h-5 text-slate-600" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Video className="w-5 h-5 text-slate-600" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Info className="w-5 h-5 text-slate-600" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser.id}
              previousMessage={messages[index - 1]}
              nextMessage={messages[index + 1]}
              currentUser={currentUser}
              chatPartner={activeChat}
            />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-2"
          >
            <img
              src={activeChat.avatar}
              alt={activeChat.name}
              className="w-6 h-6 rounded-full"
            />
            <div className="bg-slate-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <motion.div 
        className="p-4 border-t border-slate-200 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full resize-none border border-slate-300 rounded-2xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors max-h-32"
                rows="1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              
              <div className="absolute right-3 top-3 flex items-center space-x-1">
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paperclip className="w-5 h-5 text-slate-500" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showAttachments && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 p-2"
                      >
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Image className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <File className="w-4 h-4 text-green-600" />
                          <span className="text-sm">File</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="relative">
                  <motion.button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Smile className="w-5 h-5 text-slate-500" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <EmojiPicker
                        onEmojiSelect={handleEmojiSelect}
                        onClose={() => setShowEmojiPicker(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
          
          <motion.button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,*/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </motion.div>
    </div>
  )
}