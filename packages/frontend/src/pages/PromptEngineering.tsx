import React, { useState, useCallback } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  BeakerIcon,
  SparklesIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  ArrowDownTrayIcon as SaveIcon,
  DocumentDuplicateIcon as DuplicateIcon,
  TrashIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LightBulbIcon,
  VariableIcon,
  CodeBracketIcon as CodeIcon,
  ChatBubbleLeftRightIcon as ChatAltIcon,
  ClipboardDocumentIcon as ClipboardCopyIcon,
  CheckCircleIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface PromptBlock {
  id: string;
  type: 'system' | 'user' | 'assistant' | 'variable' | 'template';
  content: string;
  metadata?: {
    name?: string;
    description?: string;
    defaultValue?: string;
    options?: string[];
  };
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  blocks: PromptBlock[];
  variables: Record<string, string>;
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Block Component
const PromptBlockComponent: React.FC<{
  block: PromptBlock;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  variables: Record<string, string>;
}> = ({ block, onUpdate, onDelete, onDuplicate, variables }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const blockConfig = {
    system: {
      icon: CogIcon,
      color: 'text-vanguard-blue',
      bgColor: 'bg-vanguard-blue/10',
      borderColor: 'border-vanguard-blue/30',
      label: 'System Prompt',
    },
    user: {
      icon: ChatAltIcon,
      color: 'text-vanguard-green',
      bgColor: 'bg-vanguard-green/10',
      borderColor: 'border-vanguard-green/30',
      label: 'User Message',
    },
    assistant: {
      icon: SparklesIcon,
      color: 'text-seraphim-gold',
      bgColor: 'bg-seraphim-gold/10',
      borderColor: 'border-seraphim-gold/30',
      label: 'Assistant Response',
    },
    variable: {
      icon: VariableIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      label: 'Variable',
    },
    template: {
      icon: DocumentTextIcon,
      color: 'text-vanguard-red',
      bgColor: 'bg-vanguard-red/10',
      borderColor: 'border-vanguard-red/30',
      label: 'Template Section',
    },
  };

  const config = blockConfig[block.type];
  const Icon = config.icon;

  // Process content with variables
  const processedContent = block.content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] || match;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(processedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{config.label}</h4>
              {block.metadata?.name && (
                <p className="text-xs text-gray-400">{block.metadata.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleCopy}
              className="p-1 rounded text-gray-400 hover:text-white transition-colors"
            >
              {isCopied ? (
                <CheckCircleIcon className="h-4 w-4 text-vanguard-green" />
              ) : (
                <ClipboardCopyIcon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onDuplicate}
              className="p-1 rounded text-gray-400 hover:text-white transition-colors"
            >
              <DuplicateIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded text-red-500 hover:text-red-400 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {block.type === 'variable' ? (
                <div className="space-y-3">
                  <Input
                    label="Variable Name"
                    value={block.metadata?.name || ''}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="variableName"
                  />
                  <Input
                    label="Default Value"
                    value={block.metadata?.defaultValue || ''}
                    placeholder="Default value..."
                  />
                </div>
              ) : (
                <textarea
                  value={block.content}
                  onChange={(e) => onUpdate(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-seraphim-gold/50 resize-none"
                  rows={4}
                  placeholder={`Enter ${config.label.toLowerCase()}...`}
                />
              )}
              
              {block.metadata?.description && (
                <p className="text-xs text-gray-400 mt-2">{block.metadata.description}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Block Library
const BlockLibrary: React.FC<{
  onAddBlock: (type: PromptBlock['type']) => void;
}> = ({ onAddBlock }) => {
  const blockTypes = [
    {
      type: 'system' as const,
      name: 'System Prompt',
      description: 'Set the AI behavior and context',
      icon: CogIcon,
    },
    {
      type: 'user' as const,
      name: 'User Message',
      description: 'Simulate user input',
      icon: ChatAltIcon,
    },
    {
      type: 'assistant' as const,
      name: 'Assistant Response',
      description: 'Expected AI response',
      icon: SparklesIcon,
    },
    {
      type: 'variable' as const,
      name: 'Variable',
      description: 'Dynamic content placeholder',
      icon: VariableIcon,
    },
    {
      type: 'template' as const,
      name: 'Template Section',
      description: 'Reusable prompt component',
      icon: DocumentTextIcon,
    },
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <BeakerIcon className="h-5 w-5 text-seraphim-gold mr-2" />
        Prompt Blocks
      </h3>
      
      <div className="space-y-2">
        {blockTypes.map((blockType) => (
          <motion.button
            key={blockType.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAddBlock(blockType.type)}
            className="w-full p-3 rounded-lg border border-gray-700 hover:border-seraphim-gold/50 bg-background-card/50 text-left transition-all flex items-center space-x-3"
          >
            <blockType.icon className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{blockType.name}</p>
              <p className="text-xs text-gray-400">{blockType.description}</p>
            </div>
            <PlusIcon className="h-4 w-4 text-gray-400" />
          </motion.button>
        ))}
      </div>
    </Card>
  );
};

// Variables Panel
const VariablesPanel: React.FC<{
  variables: Record<string, string>;
  onUpdateVariable: (name: string, value: string) => void;
  onAddVariable: () => void;
}> = ({ variables, onUpdateVariable, onAddVariable }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <VariableIcon className="h-5 w-5 text-purple-500 mr-2" />
          Variables
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={onAddVariable}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {Object.entries(variables).map(([name, value]) => (
          <div key={name} className="space-y-1">
            <label className="text-xs font-medium text-gray-400">
              {`{{${name}}}`}
            </label>
            <Input
              value={value}
              onChange={(e) => onUpdateVariable(name, e.target.value)}
              placeholder="Variable value..."
              size="sm"
            />
          </div>
        ))}
        
        {Object.keys(variables).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No variables defined
          </p>
        )}
      </div>
    </Card>
  );
};

// Main Prompt Engineering Component
const PromptEngineering: React.FC = () => {
  const [blocks, setBlocks] = useState<PromptBlock[]>([
    {
      id: '1',
      type: 'system',
      content: 'You are a helpful AI assistant focused on providing accurate and secure responses.',
    },
  ]);
  
  const [variables, setVariables] = useState<Record<string, string>>({
    topic: 'AI Safety',
    context: 'enterprise environment',
  });
  
  const [settings, setSettings] = useState({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
  });

  const [isTestMode, setIsTestMode] = useState(false);
  const [testResponse, setTestResponse] = useState('');

  // Add new block
  const handleAddBlock = useCallback((type: PromptBlock['type']) => {
    const newBlock: PromptBlock = {
      id: `block-${Date.now()}`,
      type,
      content: '',
      metadata: type === 'variable' ? { name: `var${Object.keys(variables).length + 1}` } : undefined,
    };
    setBlocks([...blocks, newBlock]);
  }, [blocks, variables]);

  // Update block
  const handleUpdateBlock = useCallback((blockId: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, content } : block
    ));
  }, [blocks]);

  // Delete block
  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
  }, [blocks]);

  // Duplicate block
  const handleDuplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
      };
      const blockIndex = blocks.findIndex(b => b.id === blockId);
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, newBlock);
      setBlocks(newBlocks);
    }
  }, [blocks]);

  // Add variable
  const handleAddVariable = useCallback(() => {
    const varName = `variable${Object.keys(variables).length + 1}`;
    setVariables({ ...variables, [varName]: '' });
  }, [variables]);

  // Update variable
  const handleUpdateVariable = useCallback((name: string, value: string) => {
    setVariables({ ...variables, [name]: value });
  }, [variables]);

  // Test prompt
  const handleTestPrompt = useCallback(() => {
    setIsTestMode(true);
    // Simulate API call
    setTimeout(() => {
      setTestResponse('This is a simulated response based on your prompt configuration. In a real implementation, this would call the actual LLM API with your constructed prompt.');
      setIsTestMode(false);
    }, 2000);
  }, []);

  // Generate full prompt
  const generateFullPrompt = () => {
    return blocks.map(block => {
      let content = block.content;
      // Replace variables
      Object.entries(variables).forEach(([name, value]) => {
        content = content.replace(new RegExp(`{{${name}}}`, 'g'), value);
      });
      return `[${block.type.toUpperCase()}]\n${content}`;
    }).join('\n\n');
  };

  return (
    <div className="min-h-screen bg-seraphim-black p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <BeakerIcon className="h-6 w-6 text-seraphim-gold mr-2" />
          Prompt Engineering Canvas
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Design, test, and optimize prompts with visual building blocks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <BlockLibrary onAddBlock={handleAddBlock} />
          <VariablesPanel
            variables={variables}
            onUpdateVariable={handleUpdateVariable}
            onAddVariable={handleAddVariable}
          />
        </div>

        {/* Main Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Prompt Builder</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setBlocks([])}
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleTestPrompt}
                  disabled={isTestMode}
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  {isTestMode ? 'Testing...' : 'Test Prompt'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {blocks.map((block) => (
                  <PromptBlockComponent
                    key={block.id}
                    block={block}
                    onUpdate={(content) => handleUpdateBlock(block.id, content)}
                    onDelete={() => handleDeleteBlock(block.id)}
                    onDuplicate={() => handleDuplicateBlock(block.id)}
                    variables={variables}
                  />
                ))}
              </AnimatePresence>

              {blocks.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">
                    Add blocks from the library to start building your prompt
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Test Results */}
          {testResponse && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 text-seraphim-gold mr-2" />
                Test Results
              </h3>
              <div className="p-4 bg-black/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{testResponse}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Settings */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-seraphim-gold mr-2" />
              Model Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                  className="w-full px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-seraphim-gold/50"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-2">Claude 2</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Max Tokens: {settings.maxTokens}
                </label>
                <input
                  type="range"
                  min="256"
                  max="4096"
                  step="256"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-400 mb-1 block">
                  Top P: {settings.topP}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.topP}
                  onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  const template = {
                    name: `Template_${Date.now()}`,
                    blocks,
                    variables,
                    settings,
                    createdAt: new Date().toISOString()
                  };
                  console.log('Saving template:', template);
                  alert('Template saved successfully!');
                }}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  const fullPrompt = generateFullPrompt();
                  navigator.clipboard.writeText(fullPrompt);
                  alert('Prompt copied to clipboard!');
                }}
              >
                <DuplicateIcon className="h-4 w-4 mr-2" />
                Export Prompt
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  const codeView = `// Prompt Configuration
const promptConfig = {
  blocks: ${JSON.stringify(blocks, null, 2)},
  variables: ${JSON.stringify(variables, null, 2)},
  settings: ${JSON.stringify(settings, null, 2)}
};

// Generated Prompt
const prompt = \`${generateFullPrompt()}\`;`;
                  console.log(codeView);
                  alert('Code view logged to console!');
                }}
              >
                <CodeIcon className="h-4 w-4 mr-2" />
                View Code
              </Button>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-4 bg-seraphim-gold/10 border-seraphim-gold/30">
            <h3 className="text-sm font-semibold text-seraphim-gold mb-2 flex items-center">
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Pro Tips
            </h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Use variables for dynamic content</li>
              <li>• Test with different temperature settings</li>
              <li>• Keep system prompts concise and clear</li>
              <li>• Use examples in user messages</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromptEngineering;