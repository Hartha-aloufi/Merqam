// src/contexts/video-context.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { YouTubePlayer } from 'react-youtube';

interface VideoContextType {
  player: YouTubePlayer | null;
  isPlaying: boolean;
  currentTime: number;
  setPlayer: (player: YouTubePlayer) => void;
  playSegment: (startTime: number, endTime: number) => void;
  pauseVideo: () => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

export const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const endTimeRef = useRef<number | null>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout>();

  // Start checking current time when playing
  const startTimeUpdate = useCallback(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    timeUpdateInterval.current = setInterval(() => {
      if (player) {
        const time = player.getCurrentTime();
        setCurrentTime(time);

        // Check if we reached the end time
        if (endTimeRef.current !== null && time >= endTimeRef.current) {
          player.pauseVideo();
          endTimeRef.current = null;
        }
      }
    }, 100);
  }, [player]);

  // Play video segment
  const playSegment = useCallback((startTime: number, endTime: number) => {
    if (player) {
      endTimeRef.current = endTime;
      player.seekTo(startTime, true);
      player.playVideo();
      setIsPlaying(true);
      startTimeUpdate();
    }
  }, [player, startTimeUpdate]);

  // Pause video
  const pauseVideo = useCallback(() => {
    if (player) {
      player.pauseVideo();
      setIsPlaying(false);
      endTimeRef.current = null;
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    }
  }, [player]);

  // Clean up interval on unmount
  React.useEffect(() => {
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  return (
    <VideoContext.Provider 
      value={{
        player,
        isPlaying,
        currentTime,
        setPlayer,
        playSegment,
        pauseVideo,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideoContext = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};