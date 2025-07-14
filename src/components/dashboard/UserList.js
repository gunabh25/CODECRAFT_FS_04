/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, MoreVertical } from 'lucide-react'

export default function UserList({ users, activeChat, onChatSelect, messages }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, online, offline

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'online' && user.status === 'online') ||
                         (filter === 'offline' && user.status === 'offline')
    
    return matchesSearch && matchesFilter
  })

  const getLastMessage = (userId) => {
    const userMessages = messages[userId] || []
    return userMessages[userMessages.length - 1]
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Messages</h2>
          <motion.button
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 text-slate-600" />
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex mt-4 space-x-1 bg-slate-100 rounded-lg p-1">
          {['all', 'online', 'offline'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2">
          {filteredUsers.map((user, index) => {
            const lastMessage = getLastMessage(user.id)
            const isActive = activeChat?.id === user.id
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`relative p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                  isActive 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => onChatSelect(user)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {user.name}
                      </h3>
                      <span className="text-xs text-slate-500">
                        {lastMessage ? formatTime(lastMessage.timestamp) : ''}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 truncate">
                      {lastMessage ? lastMessage.content : 'No messages yet'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {user.unreadCount > 0 && (
                      <motion.div
                        className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {user.unreadCount}
                      </motion.div>
                    )}
                    
                    <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}