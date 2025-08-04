import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionMenuProps } from '../types';

export const ActionMenu: React.FC<ActionMenuProps> = ({
  actions,
  trigger = 'click',
  placement = 'bottom',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action: any) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const getMenuPosition = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  const menuVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
        onMouseEnter={() => trigger === 'hover' && !disabled && setIsOpen(true)}
        onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center p-2 rounded-md
          ${disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }
        `}
        aria-label="More actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`absolute ${getMenuPosition()} z-50 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}
            onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
            onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
          >
            <div className="py-1" role="menu" aria-orientation="vertical">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className={`
                    w-full text-left px-4 py-2 text-sm flex items-center
                    ${action.disabled
                      ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                      : action.danger
                      ? 'text-red-700 hover:bg-red-50 hover:text-red-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  role="menuitem"
                >
                  {action.icon && (
                    <span className="mr-3 flex-shrink-0">{action.icon}</span>
                  )}
                  <span className="flex-1">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};