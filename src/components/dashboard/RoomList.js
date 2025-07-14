import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Lock, Users, Plus, Search, Settings } from 'lucide-react';

const RoomList = ({ rooms, activeRoom, onRoomSelect, onCreateRoom, currentUser }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRoom, setNewRoom] = useState({ name: '', isPrivate: false, description: '' });

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoom = () => {
    if (newRoom.name.trim()) {
      onCreateRoom(newRoom);
      setNewRoom({ name: '', isPrivate: false, description: '' });
      setShowCreateForm(false);
    }
  };

  const roomVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const createFormVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 }
  };

  return (
    <motion.div 
      className="bg-white border-r border-gray-200 h-full"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Rooms</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <motion.input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            variants={createFormVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-gray-50 border-b border-gray-200 p-4 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3">Create New Room</h3>
            <div className="space-y-3">
              <motion.input
                type="text"
                placeholder="Room name"
                value={newRoom.name}
                onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              />
              <motion.input
                type="text"
                placeholder="Description (optional)"
                value={newRoom.description}
                onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              />
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <input
                  type="checkbox"
                  id="private"
                  checked={newRoom.isPrivate}
                  onChange={(e) => setNewRoom({...newRoom, isPrivate: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="private" className="text-sm text-gray-700">
                  Private Room
                </label>
              </motion.div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateRoom}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Create
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-y-auto h-full">
        <AnimatePresence>
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              variants={roomVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: index * 0.1 }}
              onClick={() => onRoomSelect(room)}
              className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 ${
                activeRoom?.id === room.id ? 'bg-blue-50 border-r-4 border-r-blue-500' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded-full ${
                    room.isPrivate 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {room.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 truncate">
                      {room.name}
                    </h3>
                    {room.unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-2"
                      >
                        {room.unreadCount}
                      </motion.span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {room.memberCount} members
                    </span>
                    {room.isOnline && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-green-500 rounded-full"
                      />
                    )}
                  </div>
                  
                  {room.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {room.lastMessage.sender}: {room.lastMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredRooms.length === 0 && searchTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-gray-500"
          >
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No rooms found matching &quot;{searchTerm}&quot;</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RoomList;