'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UnlockHelpTooltipProps {
  spiciness: number;
}

export function UnlockHelpTooltip({ spiciness }: UnlockHelpTooltipProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has seen the tooltip before
    const hasSeenTooltip = localStorage.getItem('hasSeenUnlockTooltip');

    if (!hasSeenTooltip && !dismissed) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setShow(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenUnlockTooltip', 'true');
    setShow(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative"
        >
          <div className="absolute -top-2 right-0 z-10 w-72 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-4 border border-white/20">
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-purple-600 rotate-45 border-r border-b border-white/20" />

            {/* Content */}
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div className="flex-1 pr-6">
                <h4 className="font-semibold mb-1 text-sm">How to Unlock</h4>
                <p className="text-xs text-white/90 leading-relaxed">
                  To see this secret, share your own secret with a spiciness rating of{' '}
                  <span className="font-bold">
                    {spiciness}🌶️
                  </span>{' '}
                  or higher. The more vulnerable you are, the more you learn!
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-white/70 hover:text-white hover:bg-white/10"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Action hint */}
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/80">
                Click &quot;Unlock&quot; below to share a secret and reveal this one
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
