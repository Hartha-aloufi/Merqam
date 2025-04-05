// src/client/hooks/use-layout-preference.ts
import { useState, useEffect } from 'react';

const LAYOUT_STORAGE_KEY = 'speakers-layout-preference';

type LayoutType = 'featured' | 'list';

export function useLayoutPreference(defaultLayout: LayoutType = 'list') {
	// Initialize with null and set actual value after checking localStorage
	const [layout, setLayout] = useState<LayoutType | null>(null);

	// Load the saved preference on mount
	useEffect(() => {
		const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
		setLayout((savedLayout as LayoutType) || defaultLayout);
	}, [defaultLayout]);

	// Update localStorage when layout changes
	const updateLayout = (newLayout: LayoutType) => {
		setLayout(newLayout);
		localStorage.setItem(LAYOUT_STORAGE_KEY, newLayout);
	};

	return {
		layout: layout || defaultLayout, // Fallback while loading
		updateLayout,
		isLoading: layout === null,
	};
}
