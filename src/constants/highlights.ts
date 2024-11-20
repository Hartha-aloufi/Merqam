// constants/highlights.ts
export const HIGHLIGHT_COLORS = {
    yellow: {
        background: '#FFF9C4',
        text: '#000000'
    },
    green: {
        background: '#C8E6C9',
        text: '#000000'
    },
    blue: {
        background: '#BBDEFB',
        text: '#000000'
    },
    purple: {
        background: '#E1BEE7',
        text: '#000000'
    }
} as const;

export type HighlightColorKey = keyof typeof HIGHLIGHT_COLORS;

// Helper function to get color value from key
export const getHighlightColor = (colorKey: HighlightColorKey) => {
    return HIGHLIGHT_COLORS[colorKey].background;
};

// Helper function to validate color key
export const isValidHighlightColor = (color: string): color is HighlightColorKey => {
    return color in HIGHLIGHT_COLORS;
};