import { useState, useCallback } from 'react';
import { fileUploadService, UploadedFile, FileProcessingResult } from '../services/api/file-upload.service';
import { useAuditLogger, ActionType } from './useAuditLogger';
import { toast } from 'react-hot-toast';

interface UseFileUploadOptions {
  useCaseId?: string;
  autoProcess?: boolean;
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: Error) => void;
  onProcessSuccess?: (result: FileProcessingResult) => void;
  onProcessError?: (error: Error) => void;
}

interface FileUploadState {
  uploading: boolean;
  uploadProgress: number;
  processing: boolean;
  uploadedFiles: UploadedFile[];
  processingResults: Map<string, FileProcessingResult>;
  errors: Map<string, Error>;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const { useCaseId, autoProcess = false, onUploadSuccess, onUploadError, onProcessSuccess, onProcessError } = options;
  const { logAction } = useAuditLogger();
  
  const [state, setState] = useState<FileUploadState>({
    uploading: false,
    uploadProgress: 0,
    processing: false,
    uploadedFiles: [],
    processingResults: new Map(),
    errors: new Map()
  });

  // Upload single file
  const uploadFile = useCallback(async (
    file: File,
    metadata?: Record<string, any>
  ): Promise<UploadedFile | null> => {
    // Validate file
    const validation = fileUploadService.validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error!);
      return null;
    }

    setState(prev => ({
      ...prev,
      uploading: true,
      uploadProgress: 0,
      errors: new Map(prev.errors)
    }));

    try {
      const uploadedFile = await fileUploadService.uploadFile(
        file,
        useCaseId,
        metadata,
        (progress) => {
          setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      setState(prev => ({
        ...prev,
        uploading: false,
        uploadProgress: 100,
        uploadedFiles: [...prev.uploadedFiles, uploadedFile]
      }));

      // Log audit action
      await logAction({
        actionType: ActionType.DATA_EXPORT,
        actionDetails: {
          component: 'FileUpload',
          description: `Uploaded file: ${file.name}`,
          parameters: {
            fileId: uploadedFile.id,
            filename: uploadedFile.originalName,
            size: uploadedFile.size,
            type: uploadedFile.mimetype
          }
        }
      });

      toast.success(`File uploaded: ${file.name}`);
      onUploadSuccess?.(uploadedFile);

      // Auto-process if enabled
      if (autoProcess) {
        await processFile(uploadedFile.id);
      }

      return uploadedFile;
    } catch (error: any) {
      const err = new Error(error.message || 'Upload failed');
      setState(prev => ({
        ...prev,
        uploading: false,
        errors: new Map(prev.errors).set(file.name, err)
      }));

      toast.error(`Failed to upload ${file.name}: ${err.message}`);
      onUploadError?.(err);
      return null;
    }
  }, [useCaseId, autoProcess, onUploadSuccess, onUploadError, logAction]);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (
    files: File[],
    metadata?: Record<string, any>
  ): Promise<UploadedFile[]> => {
    // Validate all files
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = fileUploadService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length === 0) {
      return [];
    }

    setState(prev => ({
      ...prev,
      uploading: true,
      uploadProgress: 0,
      errors: new Map(prev.errors)
    }));

    try {
      const uploadedFiles = await fileUploadService.uploadMultipleFiles(
        validFiles,
        useCaseId,
        metadata,
        (progress) => {
          setState(prev => ({ ...prev, uploadProgress: progress }));
        }
      );

      setState(prev => ({
        ...prev,
        uploading: false,
        uploadProgress: 100,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles]
      }));

      // Log audit action
      await logAction({
        actionType: ActionType.DATA_EXPORT,
        actionDetails: {
          component: 'FileUpload',
          description: `Uploaded ${uploadedFiles.length} files`,
          parameters: {
            fileCount: uploadedFiles.length,
            totalSize: uploadedFiles.reduce((sum, f) => sum + f.size, 0)
          }
        }
      });

      toast.success(`Uploaded ${uploadedFiles.length} files`);
      uploadedFiles.forEach(file => onUploadSuccess?.(file));

      // Auto-process if enabled
      if (autoProcess) {
        for (const file of uploadedFiles) {
          await processFile(file.id);
        }
      }

      return uploadedFiles;
    } catch (error: any) {
      const err = new Error(error.message || 'Bulk upload failed');
      setState(prev => ({
        ...prev,
        uploading: false,
        errors: new Map(prev.errors).set('bulk', err)
      }));

      toast.error(`Bulk upload failed: ${err.message}`);
      onUploadError?.(err);
      return [];
    }
  }, [useCaseId, autoProcess, onUploadSuccess, onUploadError, logAction]);

  // Process file
  const processFile = useCallback(async (
    fileId: string,
    processingOptions?: Record<string, any>
  ): Promise<FileProcessingResult | null> => {
    setState(prev => ({ ...prev, processing: true }));

    try {
      const result = await fileUploadService.processFile(fileId, processingOptions);
      
      setState(prev => ({
        ...prev,
        processing: false,
        processingResults: new Map(prev.processingResults).set(fileId, result)
      }));

      if (result.success) {
        toast.success('File processed successfully');
        onProcessSuccess?.(result);
      } else {
        toast.error(`Processing failed: ${result.error}`);
        onProcessError?.(new Error(result.error || 'Processing failed'));
      }

      return result;
    } catch (error: any) {
      const err = new Error(error.message || 'Processing failed');
      setState(prev => ({
        ...prev,
        processing: false,
        errors: new Map(prev.errors).set(fileId, err)
      }));

      toast.error(`Processing failed: ${err.message}`);
      onProcessError?.(err);
      return null;
    }
  }, [onProcessSuccess, onProcessError]);

  // Delete file
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      await fileUploadService.deleteFile(fileId);
      
      setState(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles.filter(f => f.id !== fileId),
        processingResults: new Map(
          Array.from(prev.processingResults).filter(([id]) => id !== fileId)
        ),
        errors: new Map(
          Array.from(prev.errors).filter(([id]) => id !== fileId)
        )
      }));

      toast.success('File deleted');
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete file: ${error.message}`);
      return false;
    }
  }, []);

  // Load use case files
  const loadUseCaseFiles = useCallback(async (): Promise<void> => {
    if (!useCaseId) return;

    try {
      const files = await fileUploadService.getUseCaseFiles(useCaseId);
      setState(prev => ({
        ...prev,
        uploadedFiles: files
      }));
    } catch (error: any) {
      toast.error(`Failed to load files: ${error.message}`);
    }
  }, [useCaseId]);

  // Clear all state
  const clearAll = useCallback(() => {
    setState({
      uploading: false,
      uploadProgress: 0,
      processing: false,
      uploadedFiles: [],
      processingResults: new Map(),
      errors: new Map()
    });
  }, []);

  return {
    ...state,
    uploadFile,
    uploadMultipleFiles,
    processFile,
    deleteFile,
    loadUseCaseFiles,
    clearAll,
    // Utility methods
    formatFileSize: fileUploadService.formatFileSize,
    getSupportedFileTypes: fileUploadService.getSupportedFileTypes,
    getMaxFileSize: fileUploadService.getMaxFileSize
  };
};