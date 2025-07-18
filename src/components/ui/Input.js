'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  icon,
  disabled = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const containerVariants = {
    focus: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    blur: {
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const labelVariants = {
    focus: {
      y: -20,
      scale: 0.85,
      color: '#3B82F6',
      transition: { duration: 0.2 }
    },
    blur: {
      y: 0,
      scale: 1,
      color: '#6B7280',
      transition: { duration: 0.2 }
    }
  };

  const hasValue = value && value.length > 0;
  const shouldAnimateLabel = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative"
        variants={containerVariants}
        animate={isFocused ? 'focus' : 'blur'}
      >
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={label ? '' : placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl
            focus:border-blue-500 focus:outline-none transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            text-gray-900 placeholder-gray-400
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <motion.label
            className={`
              absolute left-4 pointer-events-none origin-left
              ${icon ? 'left-10' : 'left-4'}
              ${shouldAnimateLabel ? 'top-0 bg-white px-1' : 'top-1/2 transform -translate-y-1/2'}
            `}
            variants={labelVariants}
            animate={shouldAnimateLabel ? 'focus' : 'blur'}
          >
            {label}
          </motion.label>
        )}

        {/* Password Toggle */}
        {type === 'password' && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </motion.button>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;