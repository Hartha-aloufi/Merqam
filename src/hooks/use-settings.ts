// src/hooks/use-settings.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontSize = 'small' | 'medium' | 'large';

interface SettingsState {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
    showHeadings: boolean;
    setShowHeadings: (show: boolean) => void;
}

export const useSettings = create<SettingsState>()(
    persist(
        (set) => ({
            fontSize: 'small',
            setFontSize: (size) => set({ fontSize: size }),
            setShowHeadings: (show) => {
                console.log(show);
                set({ showHeadings: show });
            },
            showHeadings: false,
        }),
        {
            name: 'app-settings',
        }
    )
);