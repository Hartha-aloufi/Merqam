import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VideoPosition = 'bottom' | 'top';

interface VideoSettingsState {
	position: VideoPosition;
	setPosition: (position: VideoPosition) => void;
}

export const useVideoSettings = create<VideoSettingsState>()(
	persist(
		(set) => ({
			position: 'bottom',
			setPosition: (position) => set({ position }),
		}),
		{
			name: 'video-settings',
		}
	)
);
