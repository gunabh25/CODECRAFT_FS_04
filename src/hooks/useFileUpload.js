import { useState, useCallback, useRef } from 'react';
import apiClient from '../lib/api';

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const abortControllersRef = useRef(new Map());

  // File validation
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/webm'
    ];

    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true, error: null };
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (file, roomId, onProgress) => {
    const fileId = `${file.name}-${Date.now()}`;
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [fileId]: validation.error }));
      return { success: false, error: validation.error };
    }

    // Create abort controller
    const abortController = new AbortController();
    abortControllersRef.current.set(fileId, abortController);

    try {
      // Initialize progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      setErrors(prev => ({ ...prev, [fileId]: null }));

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);

      // Upload with progress tracking
      const response = await fetch(`${apiClient.baseURL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiClient.token}`,
        },
        body: formData,
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update progress to 100%
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      // Add to uploaded files
      setUploadedFiles(prev => [...prev, {
        id: result.fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: result.url,
        roomId,
        uploadedAt: new Date().toISOString(),
      }]);

      // Clean up progress after delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 2000);

      return { success: true, data: result };

    } catch (error) {
      if (error.name === 'AbortError') {
        setErrors(prev => ({ ...prev, [fileId]: 'Upload cancelled' }));
      } else {
        setErrors(prev => ({ ...prev, [fileId]: error.message }));
      }
      
      return { success: false, error: error.message };
    } finally {
      // Clean up abort controller
      abortControllersRef.current.delete(fileId);
    }
  }, [validateFile]);

  // Upload multiple files
  const uploadFiles = useCallback(async (files, roomId, onProgress) => {
    const results = await Promise.all(
      Array.from(files).map(file => uploadFile(file, roomId, onProgress))
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      successful: successful.length,
      failed: failed.length,
      total: files.length,
      results,
    };
  }, [uploadFile]);

  // Cancel upload
  const cancelUpload = useCallback((fileId) => {
    const abortController = abortControllersRef.current.get(fileId);
    if (abortController) {
      abortController.abort();
    }
  }, []);

  // Cancel all uploads
  const cancelAllUploads = useCallback(() => {
    for (const [fileId, abortController] of abortControllersRef.current) {
      abortController.abort();
    }
    abortControllersRef.current.clear();
  }, []);

  // Remove uploaded file
  const removeUploadedFile = useCallback((fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setUploadProgress({});
    setUploadedFiles([]);
    setErrors({});
    cancelAllUploads();
  }, [cancelAllUploads]);

  // Get file type icon
  const getFileTypeIcon = useCallback((fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('text')) return '📄';
    return '📎';
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    uploadProgress,
    uploadedFiles,
    errors,
    uploadFile,
    uploadFiles,
    cancelUpload,
    cancelAllUploads,
    removeUploadedFile,
    clearErrors,
    clearAll,
    validateFile,
    getFileTypeIcon,
    formatFileSize,
  };
};