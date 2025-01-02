// src/hooks/use-reading-progress.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to track reading progress
 * @returns {number} Progress percentage (0-100)
 */
export const useReadingProgress = (): number => {
  const [progress, setProgress] = useState(0);

  const calculateProgress = useCallback(() => {
    // Get the entire scrollable height
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPosition = window.scrollY;
    
    // Calculate progress percentage
    const percentage = (scrollPosition / totalHeight) * 100;
    
    // Round to 2 decimal places and ensure it's between 0-100
    setProgress(Math.min(Math.max(Math.round(percentage * 100) / 100, 0), 100));
  }, []);

  useEffect(() => {
    // Calculate on mount
    calculateProgress();
    
    // Add scroll listener
    window.addEventListener('scroll', calculateProgress, { passive: true });
    
    // Cleanup
    return () => window.removeEventListener('scroll', calculateProgress);
  }, [calculateProgress]);

  return progress;
};