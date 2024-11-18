import { useState, useCallback } from 'react';
import { TextHighlight } from '@/types/highlight';

/**
 * Hook to manage the highlight feature state
 */
export const useHighlightState = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [activeColor, setActiveColor] = useState<string>('#FFF9C4'); // Default yellow

    const enableHighlighting = useCallback(() => setIsEnabled(true), []);
    const disableHighlighting = useCallback(() => setIsEnabled(false), []);
    const toggleHighlighting = useCallback(() => setIsEnabled(prev => !prev), []);

    return {
        isEnabled,
        activeColor,
        setActiveColor,
        enableHighlighting,
        disableHighlighting,
        toggleHighlighting,
    };
};