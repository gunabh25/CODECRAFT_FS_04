'use client'

import React, { useState, useCallback, useContext, createContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Create Context
const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null)

  const openModal = useCallback((content) => {
    setModalContent(content)
  }, [])

  const closeModal = useCallback(() => {
    setModalContent(null)
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      <AnimatePresence>
        {modalContent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-lg w-full relative shadow-xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <button
                onClick={closeModal}
                className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg"
              >
                ✕
              </button>
              {modalContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
