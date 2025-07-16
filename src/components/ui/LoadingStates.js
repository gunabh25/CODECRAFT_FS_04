// components/ui/LoadingStates.js - Loading components
'use client';

import { motion } from 'framer-motion';

export const MessageSkeleton = () => (
  <div className="flex space-x-3 p-4">
    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
    </div>
  </div>
);

export const UserListSkeleton = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export const RoomListSkeleton = () => (
  <div className="space-y-2 p-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export const SpinnerLoader = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colors = {
    blue: 'text-blue-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[color]} animate-spin`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
};

export const DotsLoader = ({ color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    gray: 'bg-gray-500',
    white: 'bg-white'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-2 h-2 rounded-full ${colors[color]}`}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
};

export const PulseLoader = ({ children, loading = false }) => (
  <motion.div
    animate={loading ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
    transition={loading ? { duration: 1.5, repeat: Infinity } : {}}
  >
    {children}
  </motion.div>
);

export const FullScreenLoader = ({ message = 'Loading...' }) => (
  <motion.div
    className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <SpinnerLoader size="xl" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </motion.div>
);

export const InlineLoader = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <SpinnerLoader size="lg" />
      <p className="mt-2 text-gray-600 text-sm">{message}</p>
    </div>
  </div>
);

export const ConnectionStatus = ({ status }) => {
  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      pulse: false
    },
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      pulse: true
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      pulse: false
    },
    reconnecting: {
      color: 'bg-orange-500',
      text: 'Reconnecting...',
      pulse: true
    }
  };

  const config = statusConfig[status] || statusConfig.disconnected;

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-600">
      <motion.div
        className={`w-2 h-2 rounded-full ${config.color}`}
        animate={config.pulse ? { opacity: [1, 0.5, 1] } : {}}
        transition={config.pulse ? { duration: 1, repeat: Infinity } : {}}
      />
      <span>{config.text}</span>
    </div>
  );
};