export interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  currentTime: number;
  duration: number;
}

export interface VolumeControlProps {
  isMuted: boolean;
  volume: number;
  onMuteToggle: () => void;
  onVolumeChange: (value: number[]) => void;
}

export interface YouTubePlayerProps {
  videoId: string;
  onReady: (event: any) => void;
  onStateChange: (event: any) => void;
}

export interface CollapseButtonProps {
  position: "top" | "bottom";
  isCollapsed: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}
