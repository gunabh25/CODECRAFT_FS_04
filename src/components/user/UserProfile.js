/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Edit3, Camera, Save, X, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const UserProfile = ({ user, onUpdateProfile, onLogout, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    location: user.location || '',
    phone: user.phone || '',
    avatar: user.avatar
  });

  const handleSave = () => {
    onUpdateProfile(profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      avatar: user.avatar
    });
    setIsEditing(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all"
                >
                  <X size={20} />
                </motion.button>
                
                <div className="text-center">
                  <motion.div
                    className="relative inline-block"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                      >
                        <Camera size={16} />
                      </motion.button>
                    )}
                  </motion.div>
                  
                  <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                  <p className="text-blue-100 text-sm">@{user.username}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-100 text-sm">Online</span>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {!isEditing ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail size={16} />
                      <span>{user.email}</span>
                    </div>
                    
                    {user.phone && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    
                    {user.location && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin size={16} />
                        <span>{user.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar size={16} />
                      <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {user.bio && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{user.bio}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-xs text-gray-500">Rooms</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">847</div>
                        <div className="text-xs text-gray-500">Messages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">23</div>
                        <div className="text-xs text-gray-500">Friends</div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 p-4">
                {!isEditing ? (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-1"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Settings size={16} />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onLogout}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <LogOut size={16} />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex-1"
                    >
                      <Save size={16} />
                      Save Changes
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserProfile;