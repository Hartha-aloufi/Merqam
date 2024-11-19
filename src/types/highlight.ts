export interface TextHighlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  elementId: string;  // Added to track which element contains the highlight
  color: string;      // Hex color value
  createdAt: string;
}

export interface LessonHighlights {
  [key: string]: TextHighlight[]; // key is `${topicId}:${lessonId}`
}

export type HighlightColors = {
  [key: string]: {
    background: string;
    text: string;
  };
};

// Default highlight colors
export const HIGHLIGHT_COLORS: HighlightColors = {
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
};