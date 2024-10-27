// src/hooks/use-keyboard-navigation.ts
import { useEffect, useCallback } from 'react';

interface NavigationOptions {
  scrollStep?: number;
  smooth?: boolean;
  scrollTargets?: string;
  onNavigate?: (direction: 'up' | 'down') => void;
}

/**
 * Hook to handle keyboard navigation in content
 */
export const useKeyboardNavigation = ({
  scrollStep = 100,
  smooth = true,
  scrollTargets = 'h1, h2, h3, h4, p',
  onNavigate,
}: NavigationOptions = {}) => {
  /**
   * Find the next or previous element to scroll to
   */
  const findTargetElement = useCallback((direction: 'up' | 'down') => {
    const elements = Array.from(document.querySelectorAll(scrollTargets));
    const viewportHeight = window.innerHeight;
    const currentScroll = window.scrollY;
    const buffer = 50; // Buffer to prevent element skipping

    if (direction === 'down') {
      // Find the first element that's below the current viewport
      return elements.find(element => {
        const rect = element.getBoundingClientRect();
        return rect.top > buffer;
      });
    } else {
      // Find the last element that's above the current viewport
      // Reverse the array to search from bottom to top
      return elements.reverse().find(element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom < 0;
      });
    }
  }, [scrollTargets]);

  /**
   * Scroll to the target element
   */
  const scrollToTarget = useCallback((element: Element | null, direction: 'up' | 'down') => {
    if (!element) return;

    const offset = 20;
    const rect = element.getBoundingClientRect();
    const targetPosition = window.scrollY + rect.top - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, [smooth]);

  /**
   * Handle keyboard events
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
      return;
    }

    let direction: 'up' | 'down' | null = null;

    switch (event.key.toLowerCase()) {
      case 'j':
      case 'arrowdown':
        direction = 'down';
        event.preventDefault();
        scrollToTarget(findTargetElement('down'), 'down');
        break;

      case 'k':
      case 'arrowup':
        direction = 'up';
        event.preventDefault();
        scrollToTarget(findTargetElement('up'), 'up');
        break;

      case ' ':
        event.preventDefault();
        if (!event.shiftKey) {
          direction = 'down';
          window.scrollBy({ 
            top: window.innerHeight * 0.8, 
            behavior: smooth ? 'smooth' : 'auto' 
          });
        } else {
          direction = 'up';
          window.scrollBy({ 
            top: -window.innerHeight * 0.8, 
            behavior: smooth ? 'smooth' : 'auto' 
          });
        }
        break;

      case 'home':
        direction = 'up';
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
        break;

      case 'end':
        direction = 'down';
        event.preventDefault();
        window.scrollTo({ 
          top: document.documentElement.scrollHeight, 
          behavior: smooth ? 'smooth' : 'auto' 
        });
        break;
    }

    if (direction && onNavigate) {
      onNavigate(direction);
    }
  }, [findTargetElement, scrollToTarget, smooth, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
};