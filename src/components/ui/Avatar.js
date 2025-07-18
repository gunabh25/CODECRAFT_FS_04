/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  status, 
  className = '',
  onClick,
  initials,
  ...props 
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 border',
    sm: 'w-2 h-2 border',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-4 h-4 border-2',
    '2xl': 'w-5 h-5 border-2'
  };

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  const avatarVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium ${sizes[size]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      variants={onClick ? avatarVariants : {}}
      whileHover={onClick ? 'hover' : {}}
      whileTap={onClick ? 'tap' : {}}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className="select-none">
          {getInitials(initials)}
        </span>
      ) : (
        <User size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      )}

      {/* Status Indicator */}
      {status && (
        <motion.div
          className={`absolute bottom-0 right-0 rounded-full border-white ${statusSizes[size]} ${statusColors[status]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            damping: 15, 
            stiffness: 300,
            delay: 0.1 
          }}
        />
      )}
    </Component>
  );
};

export default Avatar;