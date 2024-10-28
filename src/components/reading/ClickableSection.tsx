// src/components/reading/ClickableSection.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ClickableSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps content sections with larger clickable areas and navigation buttons
 */
export const ClickableSection = ({ children, className }: ClickableSectionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToSection = (direction: 'up' | 'down') => {
    const element = direction === 'up' ? 
      findTargetElement('up') : 
      findTargetElement('down');
    
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Find target elements using the same logic as our keyboard navigation
  const findTargetElement = (direction: 'up' | 'down'): Element | null => {
    const elements = Array.from(document.querySelectorAll('.clickable-section'));
    const currentElement = document.activeElement?.closest('.clickable-section');
    const currentIndex = currentElement ? 
      elements.indexOf(currentElement) : -1;

    if (direction === 'down') {
      return elements[currentIndex + 1] || null;
    }
    return elements[currentIndex - 1] || null;
  };

  return (
    <div
      className={cn(
        'clickable-section group relative rounded-lg transition-all duration-200',
        'hover:bg-accent/5 focus-within:bg-accent/5',
        'md:px-4 md:-mx-4 md:py-2',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
    >
      {/* Navigation Buttons - Only visible on hover/focus */}
      <div 
        className={cn(
          'absolute right-0 opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          'md:flex flex-col gap-1 hidden'
        )}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        <button
          onClick={() => scrollToSection('up')}
          className={cn(
            'p-1 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Previous section"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => scrollToSection('down')}
          className={cn(
            'p-1 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Next section"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};