/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useRef, useEffect } from 'react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { Paperclip, Send, Smile } from 'lucide-react'
import { useWebSocket } from '@/contexts/WebSocketContext'

const ChatArea = ({ messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const fileInputRef = useRef(null)
  const websocket = useWebSocket()

  const handleSendMessage = (e) => {
    e.preventDefault()
    const trimmed = newMessage.trim()
    if (trimmed && websocket) {
      websocket.sendMessage(1, trimmed)
      setNewMessage('')
      setShowEmojiPicker(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (websocket) {
          websocket.sendMessage(2, reader.result) // Sending image as base64
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.native)
  }

  const handleTyping = () => {
    if (websocket) {
      websocket.sendMessage(100, true) // Send typing status
    }
  }

  useEffect(() => {
    if (!websocket) return

    const handleMessage = (data) => {
      onSendMessage(data, 'received') // Add new incoming message
    }

    websocket.on('message', handleMessage)

    return () => {
      websocket.off('message', handleMessage)
    }
  }, [websocket, onSendMessage])

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-white ${
                msg.sender === 'user' ? 'bg-blue-500' : 'bg-gray-500'
              }`}
            >
              {msg.type === 'image' ? (
                <img
                  src={msg.text}
                  alt="uploaded"
                  className="max-w-[200px] max-h-[200px] rounded"
                />
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-2 border-t border-gray-200"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-gray-500 hover:text-gray-700"
        >
          <Smile className="w-5 h-5" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-16 left-2 z-50">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} />
          </div>
        )}

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message"
          className="flex-1 px-3 py-2 mx-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="text-gray-500 hover:text-gray-700 mr-2"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default ChatArea
