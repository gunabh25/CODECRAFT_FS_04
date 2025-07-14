/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { 
  MessageCircle, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Sidebar({ user, isOpen, onToggle, connectionStatus }) {
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    router.push('/auth')
  }

  const menuItems = [
    { icon: MessageCircle, label: 'Chats', active: true },
    { icon: Users, label: 'Groups', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ]

  return (
    <motion.div
      className="h-full bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col"
      animate={{ width: isOpen ? 320 : 80 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={onToggle}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
          
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center space-x-2"
            >
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
            </motion.div>
          )}
        </div>
        
        {isOpen && (
          <motion.h1 
            className="text-2xl font-bold gradient-text mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            ChatFlow
          </motion.h1>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 rounded-full ring-2 ring-blue-500"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </motion.div>
          
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-semibold text-slate-800">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4">
        <nav className="space-y-2 px-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                item.active 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="font-medium">Logout</span>}
        </motion.button>
      </div>
    </motion.div>
  )
}