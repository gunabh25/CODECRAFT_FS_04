/* eslint-disable jsx-a11y/alt-text */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Image, FileText, Mic } from 'lucide-react';

const MessageInput = ({ onSendMessage, isTyping, setIsTyping }) => {
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (type) => {
    if (type === 'image') {
      imageInputRef.current.click();
    } else {
      fileInputRef.current.click();
    }
    setShowAttachments(false);
  };

  const attachmentVariants = {
    hidden: { scale: 0, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0, opacity: 0, y: 20 }
  };

  return (
    <motion.div 
      className="bg-white border-t border-gray-200 p-4"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            className="flex gap-2 mb-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              variants={attachmentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.1 }}
              onClick={() => handleFileUpload('image')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Image size={16} />
              <span className="text-sm">Image</span>
            </motion.button>
            <motion.button
              variants={attachmentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: 0.2 }}
              onClick={() => handleFileUpload('file')}
              className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
            >
              <FileText size={16} />
              <span className="text-sm">File</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <div className="flex items-end gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAttachments(!showAttachments)}
            className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Paperclip size={20} />
          </motion.button>

          <div className="flex-1 relative">
            <motion.textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              animate={{
                boxShadow: isTyping ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : '0 0 0 0px rgba(59, 130, 246, 0.2)'
              }}
              transition={{ duration: 0.2 }}
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Smile size={20} />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={isRecording ? () => setIsRecording(false) : () => setIsRecording(true)}
            className={`p-2 rounded-full transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'text-gray-500 hover:text-blue-600'
            }`}
          >
            <Mic size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`p-2 rounded-full transition-all duration-200 ${
              message.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </motion.button>
        </div>

        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 mt-2 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 text-sm">Recording...</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsRecording(false)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                Stop
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.zip"
        onChange={(e) => {
          // Handle file upload
          console.log('File selected:', e.target.files[0]);
        }}
      />
      
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          // Handle image upload
          console.log('Image selected:', e.target.files[0]);
        }}
      />
    </motion.div>
  );
};

export default MessageInput;