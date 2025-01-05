// src/lib/txt-to-mdx/types.ts
export interface TranscriptResult {
  videoId: string;
  title: string;
  files: {
    txt: string;
    srt: string;
  };
  timestamp: string;
}
