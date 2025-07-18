'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  action
}) => {
  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-yellow-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  const colors = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-yellow-200 bg-yellow-50',
    info: 'border-blue-200 bg-blue-50'
  };

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const toastVariants = {
    hidden: {
      opacity: 0,
      x: 300,
      scale: 0.8,
      rotateZ: 5
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      rotateZ: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      x: 300,
      scale: 0.8,
      rotateZ: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  const progressVariants = {
    initial: { scaleX: 1 },
    animate: { 
      scaleX: 0,
      transition: { 
        duration: duration / 1000, 
        ease: 'linear' 
      }
    }
  };

  return (
    <motion.div
      className={`max-w-sm w-full bg-white rounded-lg shadow-lg border-2 overflow-hidden ${colors[type]}`}
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      {/* Progress Bar */}
      {duration > 0 && (
        <div className="h-1 bg-gray-200 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 origin-left"
            variants={progressVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {icons[type]}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {title}
              </h4>
            )}
            
            {message && (
              <p className="text-sm text-gray-700">
                {message}
              </p>
            )}

            {action && (
              <div className="mt-3">
                <motion.button
                  onClick={action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.label}
                </motion.button>
              </div>
            )}
          </div>

          <motion.button
            onClick={() => onClose(id)}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
export { ToastContainer };