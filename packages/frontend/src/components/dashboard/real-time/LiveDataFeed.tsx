import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { LiveDataFeedProps } from '../types';

export function LiveDataFeed<T>({
  items,
  renderItem,
  maxItems = 10,
  showTimestamp = true,
  autoScroll = true,
}: LiveDataFeedProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [items, autoScroll]);

  const displayItems = items.slice(0, maxItems);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Live Feed</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Real-time updates</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{ maxHeight: '400px' }}
      >
        <AnimatePresence initial={false}>
          {displayItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>No data available</p>
              <p className="text-sm mt-1">Waiting for updates...</p>
            </div>
          ) : (
            displayItems.map((item, index) => (
              <motion.div
                key={`item-${index}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-100 last:border-b-0"
              >
                <div className="px-6 py-4">
                  {showTimestamp && (
                    <div className="text-xs text-gray-400 mb-1">
                      {formatTimestamp(new Date())}
                    </div>
                  )}
                  {renderItem(item)}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {items.length > maxItems && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Showing {maxItems} of {items.length} items
          </p>
        </div>
      )}
    </div>
  );
}