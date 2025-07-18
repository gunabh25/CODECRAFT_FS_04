'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ 
  trigger, 
  children, 
  position = 'bottom-left',
  className = '',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positions = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2'
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: position.includes('bottom') ? -10 : 10,
      transition: { duration: 0.1 }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        duration: 0.2
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <motion.div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        {trigger}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-50 min-w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${positions[position]}`}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  icon,
  destructive = false 
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        w-full flex items-center px-4 py-2 text-sm text-left
        ${destructive ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={!disabled ? { backgroundColor: destructive ? '#FEF2F2' : '#F9FAFB' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {icon && (
        <span className="mr-3 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </motion.button>
  );
};

const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-200" />;
};

const DropdownSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option',
  className = '',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const trigger = (
    <div className={`
      flex items-center justify-between px-4 py-2 bg-white border-2 border-gray-200 
      rounded-lg hover:border-gray-300 focus:border-blue-500 focus:outline-none
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `}>
      <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown size={16} className="text-gray-400" />
      </motion.div>
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      disabled={disabled}
      className={className}
    >
      {options.map((option) => (
        <DropdownItem
          key={option.value}
          onClick={() => handleSelect(option)}
          className={value === option.value ? 'bg-blue-50 text-blue-600' : ''}
        >
          {option.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export default Dropdown;
export { DropdownItem, DropdownDivider, DropdownSelect };