import { api } from '../api';

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedAt: Date;
  uploadedBy: string;
  useCaseId?: string;
  metadata?: Record<string, any>;
  hash?: string;
  processed?: boolean;
  processingResult?: any;
}

export interface FileProcessingResult {
  fileId: string;
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
}

class FileUploadService {
  /**
   * Upload a single file
   */
  async uploadFile(
    file: File,
    useCaseId?: string,
    metadata?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (useCaseId) {
      formData.append('useCaseId', useCaseId);
    }
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.file;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    useCaseId?: string,
    metadata?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    if (useCaseId) {
      formData.append('useCaseId', useCaseId);
    }
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await api.post('/files/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.files;
  }

  /**
   * Process an uploaded file
   */
  async processFile(
    fileId: string,
    processingOptions?: Record<string, any>
  ): Promise<FileProcessingResult> {
    const response = await api.post(`/files/process/${fileId}`, {
      processingOptions
    });
    return response.data.result;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<UploadedFile> {
    const response = await api.get(`/files/file/${fileId}`);
    return response.data.file;
  }

  /**
   * Get files for a use case
   */
  async getUseCaseFiles(useCaseId: string): Promise<UploadedFile[]> {
    const response = await api.get(`/files/use-case/${useCaseId}`);
    return response.data.files;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/files/file/${fileId}`);
  }

  /**
   * Validate file integrity
   */
  async validateFileIntegrity(fileId: string): Promise<boolean> {
    const response = await api.post(`/files/validate/${fileId}`);
    return response.data.valid;
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string, filename: string): Promise<void> {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob'
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Get supported file types
   */
  getSupportedFileTypes(): string[] {
    return [
      '.pdf',
      '.xls',
      '.xlsx',
      '.csv',
      '.json',
      '.txt',
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.doc',
      '.docx'
    ];
  }

  /**
   * Get max file size in bytes
   */
  getMaxFileSize(): number {
    return 52428800; // 50MB
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = this.getMaxFileSize();
    const supportedTypes = this.getSupportedFileTypes();
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`
      };
    }

    if (!supportedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type ${fileExtension} is not supported`
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();