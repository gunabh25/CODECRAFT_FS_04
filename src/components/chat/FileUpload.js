/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
'use client'

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, File, Image, Video, Music, Archive, FileText, Download, Eye
} from 'lucide-react';

const FileUpload = ({ onFileUpload, onClose, maxFileSize = 10 * 1024 * 1024 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video size={20} className="text-red-500" />;
    if (fileType.startsWith('audio/')) return <Music size={20} className="text-purple-500" />;
    if (fileType.includes('pdf')) return <FileText size={20} className="text-red-600" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive size={20} className="text-yellow-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => file.size <= maxFileSize);

    if (validFiles.length !== selectedFiles.length) {
      alert(`Some files were too large. Max file size is ${formatFileSize(maxFileSize)}.`);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const startUpload = () => {
    setUploading(true);
    const progress = {};

    files.forEach((file, index) => {
      const fakeProgress = setInterval(() => {
        setUploadProgress(prev => {
          const updated = { ...prev };
          updated[file.name] = (updated[file.name] || 0) + 10;
          if (updated[file.name] >= 100) {
            clearInterval(fakeProgress);
            updated[file.name] = 100;
            if (Object.values(updated).every(p => p === 100)) {
              setTimeout(() => {
                onFileUpload(files);
                setUploading(false);
              }, 500);
            }
          }
          return updated;
        });
      }, 200);
    });
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40`}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-red-500" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload className="mx-auto mb-2 text-gray-500" size={32} />
          <p className="text-sm text-gray-600">Drag & drop files here or click to browse</p>
          <input
            type="file"
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between border px-3 py-2 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <div className="text-sm">
                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                {uploading ? (
                  <div className="text-xs text-blue-600">
                    {uploadProgress[file.name] || 0}%
                  </div>
                ) : (
                  <button
                    className="text-xs text-red-500 hover:underline"
                    onClick={() => {
                      setFiles(prev => prev.filter(f => f.name !== file.name));
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={startUpload}
            disabled={files.length === 0 || uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUpload;
