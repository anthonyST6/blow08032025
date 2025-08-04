import React, { useState } from 'react';
import { Modal } from './Modal';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
}

export const JsonModal: React.FC<JsonModalProps> = ({ isOpen, onClose, title, data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return 'Error formatting JSON';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="flex items-center space-x-2"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-4 h-4" />
                <span>Copy JSON</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-black/50 rounded-lg p-4 max-h-[60vh] overflow-auto">
          <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
            {formatJson(data)}
          </pre>
        </div>
      </div>
    </Modal>
  );
};