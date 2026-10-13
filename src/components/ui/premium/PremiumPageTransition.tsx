import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface PremiumPageTransitionProps {
  pageKey: string | number;
  children: React.ReactNode;
  className?: string;
}

export const PremiumPageTransition: React.FC<PremiumPageTransitionProps> = ({
  pageKey,
  children,
  className = ''
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{
          duration: 0.2,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={`w-full max-w-full min-w-0 ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PremiumPageTransition;
