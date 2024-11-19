import { useState, useCallback } from 'react';

/**
 * Hook to manage the highlight feature state
 */
export const useHighlightState = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [activeColor, setActiveColor] = useState<string>('#FFF9C4'); // Default yellow

    const enableHighlighting = useCallback(() => {
        setIsEnabled(true);
        setIsDeleteMode(false);
    }, []);

    const disableHighlighting = useCallback(() => {
        setIsEnabled(false);
        setIsDeleteMode(false);
    }, []);

    const toggleHighlighting = useCallback(() => {
        setIsEnabled(prev => !prev);
        setIsDeleteMode(false);
    }, []);

    const toggleDeleteMode = useCallback((enabled: boolean) => {
        setIsDeleteMode(enabled);
    }, []);

    return {
        isEnabled,
        isDeleteMode,
        activeColor,
        setActiveColor,
        enableHighlighting,
        disableHighlighting,
        toggleHighlighting,
        toggleDeleteMode,
    };
};