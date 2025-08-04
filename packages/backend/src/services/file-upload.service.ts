import * as multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { auditTrailService } from './audit-trail.service';
import { wsServer } from '../websocket/server';
import crypto from 'crypto';

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
  private uploadDir: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB default
    this.allowedMimeTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/json',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      logger.info(`Created upload directory: ${this.uploadDir}`);
    }
  }

  // Configure multer for file uploads
  getMulterConfig(useCaseId?: string) {
    const storage = multer.diskStorage({
      destination: async (req: any, file: any, cb: any) => {
        const subDir = useCaseId ? path.join(this.uploadDir, useCaseId) : this.uploadDir;
        try {
          await fs.mkdir(subDir, { recursive: true });
          cb(null, subDir);
        } catch (error: any) {
          cb(error, subDir);
        }
      },
      filename: (req: any, file: any, cb: any) => {
        const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: (req: any, file: any, cb: any) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} not allowed`));
        }
      }
    });
  }

  // Calculate file hash for integrity verification
  private async calculateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  // Save file metadata
  async saveFileMetadata(
    file: any, // Express.Multer.File
    userId: string,
    userEmail: string,
    useCaseId?: string,
    metadata?: Record<string, any>
  ): Promise<UploadedFile> {
    try {
      const fileHash = await this.calculateFileHash(file.path);
      
      const uploadedFile: UploadedFile = {
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedAt: new Date(),
        uploadedBy: userId,
        useCaseId,
        metadata,
        hash: fileHash,
        processed: false
      };

      // In a real implementation, save to database
      // For now, save to a JSON file
      const metadataPath = path.join(this.uploadDir, 'metadata.json');
      let allMetadata: UploadedFile[] = [];
      
      try {
        const existing = await fs.readFile(metadataPath, 'utf-8');
        allMetadata = JSON.parse(existing);
      } catch {
        // File doesn't exist yet
      }
      
      allMetadata.push(uploadedFile);
      await fs.writeFile(metadataPath, JSON.stringify(allMetadata, null, 2));

      // Log audit trail
      await auditTrailService.logAction({
        userId,
        userEmail,
        action: 'file.upload',
        resource: 'file',
        resourceId: uploadedFile.id,
        details: {
          filename: uploadedFile.originalName,
          size: uploadedFile.size,
          mimetype: uploadedFile.mimetype,
          useCaseId
        },
        result: 'success'
      });

      // Send WebSocket notification
      if (useCaseId && (wsServer as any).io) {
        (wsServer as any).io.to(`usecase:${useCaseId}`).emit('file:uploaded', {
          fileId: uploadedFile.id,
          filename: uploadedFile.originalName,
          uploadedBy: userId,
          timestamp: uploadedFile.uploadedAt
        });
      }

      logger.info(`File uploaded successfully: ${uploadedFile.id}`);
      return uploadedFile;
    } catch (error) {
      logger.error('Failed to save file metadata:', error);
      throw error;
    }
  }

  // Process uploaded file based on type
  async processFile(
    fileId: string,
    userId: string,
    processingOptions?: Record<string, any>
  ): Promise<FileProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Get file metadata
      const file = await this.getFileMetadata(fileId);
      if (!file) {
        throw new Error('File not found');
      }

      let processingResult: any;

      // Process based on file type
      switch (file.mimetype) {
        case 'text/csv':
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          processingResult = await this.processSpreadsheet(file, processingOptions);
          break;
        
        case 'application/pdf':
          processingResult = await this.processPDF(file, processingOptions);
          break;
        
        case 'application/json':
          processingResult = await this.processJSON(file, processingOptions);
          break;
        
        case 'text/plain':
          processingResult = await this.processText(file, processingOptions);
          break;
        
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
          processingResult = await this.processImage(file, processingOptions);
          break;
        
        default:
          processingResult = { 
            message: 'File type processing not implemented',
            fileInfo: {
              id: file.id,
              name: file.originalName,
              type: file.mimetype,
              size: file.size
            }
          };
      }

      // Update file metadata with processing result
      await this.updateFileMetadata(fileId, {
        processed: true,
        processingResult
      });

      const processingTime = Date.now() - startTime;

      // Send WebSocket notification
      if (file.useCaseId && (wsServer as any).io) {
        (wsServer as any).io.to(`usecase:${file.useCaseId}`).emit('file:processed', {
          fileId,
          success: true,
          processingTime
        });
      }

      return {
        fileId,
        success: true,
        data: processingResult,
        processingTime
      };
    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error(`File processing failed for ${fileId}:`, error);
      
      return {
        fileId,
        success: false,
        error: error.message,
        processingTime
      };
    }
  }

  // Process spreadsheet files
  private async processSpreadsheet(
    file: UploadedFile,
    options?: Record<string, any>
  ): Promise<any> {
    // In a real implementation, use libraries like xlsx or csv-parse
    // For now, return mock data
    return {
      type: 'spreadsheet',
      rowCount: 100,
      columnCount: 10,
      sheets: ['Sheet1'],
      preview: [
        ['Header1', 'Header2', 'Header3'],
        ['Value1', 'Value2', 'Value3']
      ]
    };
  }

  // Process PDF files
  private async processPDF(
    file: UploadedFile,
    options?: Record<string, any>
  ): Promise<any> {
    // In a real implementation, use libraries like pdf-parse
    // For now, return mock data
    return {
      type: 'pdf',
      pageCount: 10,
      textContent: 'Sample PDF content...',
      metadata: {
        title: 'Sample PDF',
        author: 'System',
        creationDate: new Date()
      }
    };
  }

  // Process JSON files
  private async processJSON(
    file: UploadedFile,
    options?: Record<string, any>
  ): Promise<any> {
    const content = await fs.readFile(file.path, 'utf-8');
    const data = JSON.parse(content);
    
    return {
      type: 'json',
      data,
      schema: this.inferJSONSchema(data)
    };
  }

  // Process text files
  private async processText(
    file: UploadedFile,
    options?: Record<string, any>
  ): Promise<any> {
    const content = await fs.readFile(file.path, 'utf-8');
    
    return {
      type: 'text',
      content,
      lineCount: content.split('\n').length,
      wordCount: content.split(/\s+/).length,
      characterCount: content.length
    };
  }

  // Process image files
  private async processImage(
    file: UploadedFile,
    options?: Record<string, any>
  ): Promise<any> {
    // In a real implementation, use libraries like sharp or jimp
    // For now, return mock data
    return {
      type: 'image',
      format: file.mimetype.split('/')[1],
      size: {
        width: 1920,
        height: 1080
      },
      fileSize: file.size
    };
  }

  // Infer JSON schema
  private inferJSONSchema(data: any): any {
    if (Array.isArray(data)) {
      return {
        type: 'array',
        items: data.length > 0 ? this.inferJSONSchema(data[0]) : {}
      };
    } else if (typeof data === 'object' && data !== null) {
      const properties: any = {};
      for (const key in data) {
        properties[key] = this.inferJSONSchema(data[key]);
      }
      return { type: 'object', properties };
    } else {
      return { type: typeof data };
    }
  }

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<UploadedFile | null> {
    try {
      const metadataPath = path.join(this.uploadDir, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const allMetadata: UploadedFile[] = JSON.parse(content);
      
      return allMetadata.find(file => file.id === fileId) || null;
    } catch {
      return null;
    }
  }

  // Update file metadata
  private async updateFileMetadata(
    fileId: string,
    updates: Partial<UploadedFile>
  ): Promise<void> {
    try {
      const metadataPath = path.join(this.uploadDir, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const allMetadata: UploadedFile[] = JSON.parse(content);
      
      const index = allMetadata.findIndex(file => file.id === fileId);
      if (index !== -1) {
        allMetadata[index] = { ...allMetadata[index], ...updates };
        await fs.writeFile(metadataPath, JSON.stringify(allMetadata, null, 2));
      }
    } catch (error) {
      logger.error('Failed to update file metadata:', error);
    }
  }

  // Delete file
  async deleteFile(
    fileId: string,
    userId: string,
    userEmail: string
  ): Promise<boolean> {
    try {
      const file = await this.getFileMetadata(fileId);
      if (!file) {
        return false;
      }

      // Delete physical file
      await fs.unlink(file.path);

      // Remove from metadata
      const metadataPath = path.join(this.uploadDir, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const allMetadata: UploadedFile[] = JSON.parse(content);
      
      const filtered = allMetadata.filter(f => f.id !== fileId);
      await fs.writeFile(metadataPath, JSON.stringify(filtered, null, 2));

      // Log audit trail
      await auditTrailService.logAction({
        userId,
        userEmail,
        action: 'file.delete',
        resource: 'file',
        resourceId: fileId,
        details: {
          filename: file.originalName
        },
        result: 'success'
      });

      logger.info(`File deleted: ${fileId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete file ${fileId}:`, error);
      return false;
    }
  }

  // Get files for a use case
  async getUseCaseFiles(useCaseId: string): Promise<UploadedFile[]> {
    try {
      const metadataPath = path.join(this.uploadDir, 'metadata.json');
      const content = await fs.readFile(metadataPath, 'utf-8');
      const allMetadata: UploadedFile[] = JSON.parse(content);
      
      return allMetadata.filter(file => file.useCaseId === useCaseId);
    } catch {
      return [];
    }
  }

  // Validate file integrity
  async validateFileIntegrity(fileId: string): Promise<boolean> {
    try {
      const file = await this.getFileMetadata(fileId);
      if (!file || !file.hash) {
        return false;
      }

      const currentHash = await this.calculateFileHash(file.path);
      return currentHash === file.hash;
    } catch {
      return false;
    }
  }
}

export const fileUploadService = new FileUploadService();