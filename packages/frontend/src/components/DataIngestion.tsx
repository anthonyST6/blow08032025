import React, { useState, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { toast } from 'react-hot-toast';

interface DataIngestionProps {
  useCaseId: string;
  onDataIngested?: (data: IngestedData) => void;
}

export interface IngestedData {
  id: string;
  useCaseId: string;
  fileName: string;
  fileType: 'csv' | 'json' | 'xml' | 'pdf';
  uploadDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  recordCount?: number;
  dataPreview?: any[];
  fileSize: number;
}

const DataIngestion: React.FC<DataIngestionProps> = ({ useCaseId, onDataIngested }) => {
  const [uploadedFile, setUploadedFile] = useState<IngestedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const processFile = useCallback(async (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase() as IngestedData['fileType'];

    if (!['csv', 'json', 'xml', 'pdf'].includes(fileType)) {
      toast.error('Unsupported file type. Please upload CSV, JSON, XML, or PDF files.');
      return;
    }

    setIsProcessing(true);

    // Create initial data object
    const ingestedData: IngestedData = {
      id: `data-${Date.now()}`,
      useCaseId,
      fileName: file.name,
      fileType,
      uploadDate: new Date(),
      status: 'processing',
      fileSize: file.size,
    };

    setUploadedFile(ingestedData);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Parse file content for preview (simplified for demo)
      if (fileType === 'csv') {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const records = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as any);
        });

        ingestedData.recordCount = lines.length - 1;
        ingestedData.dataPreview = records;
      }

      ingestedData.status = 'completed';
      setUploadedFile({ ...ingestedData });
      
      toast.success(`Successfully ingested ${file.name}`);
      
      if (onDataIngested) {
        onDataIngested(ingestedData);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      ingestedData.status = 'error';
      setUploadedFile({ ...ingestedData });
      toast.error('Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [useCaseId, onDataIngested]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && !isProcessing) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && !isProcessing) {
      processFile(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = () => {
    switch (uploadedFile?.status) {
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-vanguard-green" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive 
            ? 'border-seraphim-gold bg-seraphim-gold/10' 
            : 'border-white/20 hover:border-white/40 bg-black/30'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv,.json,.xml,.pdf"
          onChange={handleFileSelect}
          disabled={isProcessing}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center space-y-3"
          >
            <CloudArrowUpIcon className={`h-12 w-12 ${isDragActive ? 'text-seraphim-gold' : 'text-gray-400'}`} />
            
            <div>
              <p className="text-sm font-medium text-white">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your data file here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                or click to browse (CSV, JSON, XML, PDF)
              </p>
            </div>
          </motion.div>
        </label>

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 text-seraphim-gold animate-spin mx-auto mb-2" />
              <p className="text-sm text-white">Processing file...</p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded file info */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" padding="sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <DocumentTextIcon className="h-6 w-6 text-seraphim-gold mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{uploadedFile.fileName}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-400">
                        {formatFileSize(uploadedFile.fileSize)}
                      </span>
                      {uploadedFile.recordCount && (
                        <span className="text-xs text-gray-400">
                          {uploadedFile.recordCount} records
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(uploadedFile.uploadDate).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  
                  {uploadedFile.status === 'completed' && uploadedFile.dataPreview && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {showPreview ? 'Hide' : 'Preview'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Data preview */}
              {showPreview && uploadedFile.dataPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="bg-black/50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <TableCellsIcon className="h-4 w-4 text-seraphim-gold mr-2" />
                      <h4 className="text-sm font-semibold text-white">Data Preview</h4>
                      <span className="text-xs text-gray-400 ml-2">(First 5 records)</span>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            {Object.keys(uploadedFile.dataPreview[0] || {}).map((header) => (
                              <th key={header} className="px-3 py-2 text-left text-gray-400 font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedFile.dataPreview.map((row, index) => (
                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                              {Object.values(row).map((value: any, idx) => (
                                <td key={idx} className="px-3 py-2 text-gray-300">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DataIngestion;