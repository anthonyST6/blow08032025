import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { fileUploadService } from '../services/file-upload.service';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer middleware
const getUploadMiddleware = (useCaseId?: string) => {
  return fileUploadService.getMulterConfig(useCaseId).single('file');
};

// Upload a file
router.post('/upload',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { useCaseId, metadata } = req.body;

    // Use multer middleware dynamically
    const upload = getUploadMiddleware(useCaseId);
    
    upload(req, res, async (err: any) => {
      if (err) {
        logger.error('File upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message || 'File upload failed'
        });
      }

      if (!(req as any).file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      try {
        const uploadedFile = await fileUploadService.saveFileMetadata(
          (req as any).file,
          user.uid,
          user.email,
          useCaseId,
          metadata
        );

        res.json({
          success: true,
          file: uploadedFile
        });
      } catch (error: any) {
        logger.error('Failed to save file metadata:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to save file'
        });
      }
    });
  })
);

// Process an uploaded file
router.post('/process/:fileId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const { processingOptions } = req.body;
    const user = (req as any).user;

    try {
      const result = await fileUploadService.processFile(
        fileId,
        user.uid,
        processingOptions
      );

      res.json({
        success: true,
        result
      });
    } catch (error: any) {
      logger.error(`Failed to process file ${fileId}:`, error);
      res.status(500).json({
        success: false,
        error: error.message || 'File processing failed'
      });
    }
  })
);

// Get file metadata
router.get('/file/:fileId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const file = await fileUploadService.getFileMetadata(fileId);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      file
    });
  })
);

// Get files for a use case
router.get('/use-case/:useCaseId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { useCaseId } = req.params;

    const files = await fileUploadService.getUseCaseFiles(useCaseId);
    
    res.json({
      success: true,
      files,
      total: files.length
    });
  })
);

// Delete a file
router.delete('/file/:fileId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const user = (req as any).user;

    const deleted = await fileUploadService.deleteFile(
      fileId,
      user.uid,
      user.email
    );
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'File not found or could not be deleted'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  })
);

// Validate file integrity
router.post('/validate/:fileId',
  authMiddleware,
  requireRole(['admin', 'risk_officer']),
  asyncHandler(async (req: Request, res: Response) => {
    const { fileId } = req.params;

    const isValid = await fileUploadService.validateFileIntegrity(fileId);
    
    res.json({
      success: true,
      fileId,
      valid: isValid
    });
  })
);

// Bulk upload multiple files
router.post('/bulk-upload',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { useCaseId, metadata } = req.body;

    // Use multer middleware for multiple files
    const upload = fileUploadService.getMulterConfig(useCaseId).array('files', 10);
    
    upload(req, res, async (err: any) => {
      if (err) {
        logger.error('Bulk upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message || 'Bulk upload failed'
        });
      }

      const files = (req as any).files as any[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided'
        });
      }

      try {
        const uploadedFiles = await Promise.all(
          files.map(file => 
            fileUploadService.saveFileMetadata(
              file,
              user.uid,
              user.email,
              useCaseId,
              metadata
            )
          )
        );

        res.json({
          success: true,
          files: uploadedFiles,
          total: uploadedFiles.length
        });
      } catch (error: any) {
        logger.error('Failed to save bulk files:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to save files'
        });
      }
    });
  })
);

export default router;