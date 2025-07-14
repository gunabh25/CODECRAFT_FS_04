/* eslint-disable @next/next/no-img-element */
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

const TypingIndicator = ({ typingUsers }) => {
  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].name} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
    return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
  };

  const dotVariants = {
    hidden: { opacity: 0.2, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <AnimatePresence>
      {typingUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 20, height: 0 }}
          className="px-4 py-2 mb-2"
        >
          <motion.div
            className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 max-w-xs"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="flex -space-x-2">
              {typingUsers.slice(0, 3).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ scale: 0, x: -10 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={12} className="text-white" />
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{getTypingText()}</span>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    variants={dotVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;