import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  maxWidth?: '1600px' | '7xl' | 'full' | '6xl' | '5xl' | '4xl';
}

/**
 * Standard enterprise layout container for SKANDA modules.
 * Enforces unified horizontal alignment, consistent maximum content width,
 * standardized vertical rhythm, and bottom clearance across all modules.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  id,
  maxWidth = '1600px'
}) => {
  const maxWidthClass =
    maxWidth === 'full'
      ? 'w-full'
      : maxWidth === '6xl'
      ? 'max-w-6xl mx-auto'
      : maxWidth === '5xl'
      ? 'max-w-5xl mx-auto'
      : maxWidth === '4xl'
      ? 'max-w-4xl mx-auto'
      : maxWidth === '7xl'
      ? 'max-w-7xl mx-auto'
      : 'max-w-[1600px] mx-auto';

  return (
    <div
      id={id}
      className={`w-full min-w-0 ${maxWidthClass} space-y-4 sm:space-y-5 pb-6 sm:pb-8 transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
