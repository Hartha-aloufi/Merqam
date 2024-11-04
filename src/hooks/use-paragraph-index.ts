'use client';

import { useRef } from 'react';

export function useParagraphIndex() {
    const indexRef = useRef(0);

    const getNextIndex = () => {
        const currentIndex = indexRef.current;
        indexRef.current += 1;
        return currentIndex;
    };

    const resetIndex = () => {
        indexRef.current = 0;
    };

    return { getNextIndex, resetIndex };
}