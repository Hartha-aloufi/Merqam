/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type JobStatus = "cancelled" | "completed" | "failed" | "pending" | "processing";

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [x: string]: JsonValue | undefined;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface GenerationJobs {
  ai_service: Generated<string>;
  completed_at: Timestamp | null;
  created_at: Generated<Timestamp>;
  error: string | null;
  id: Generated<string>;
  new_playlist_id: string | null;
  new_playlist_title: string | null;
  new_speaker_name: string | null;
  playlist_id: string | null;
  priority: Generated<number>;
  progress: Generated<number>;
  result: Json | null;
  speaker_id: string | null;
  started_at: Timestamp | null;
  status: Generated<JobStatus>;
  updated_at: Generated<Timestamp>;
  url: string;
  user_id: string;
}

export interface Highlights {
  created_at: Generated<Timestamp>;
  highlights: Json;
  id: Generated<string>;
  lesson_id: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface Lessons {
  content_key: string;
  created_at: Generated<Timestamp>;
  description: string | null;
  id: Generated<string>;
  playlist_id: string | null;
  speaker_id: string;
  tags: Json | null;
  title: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
  views_count: Generated<number>;
  youtube_video_id: string | null;
}

export interface Notes {
  content: string;
  created_at: Generated<Timestamp>;
  highlight_id: string | null;
  id: Generated<string>;
  label_color: string | null;
  lesson_id: string;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface NotesTags {
  created_at: Generated<Timestamp>;
  note_id: string;
  tag_id: string;
}

export interface NoteTags {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  name: string;
  user_id: string;
}

export interface Playlists {
  created_at: Generated<Timestamp>;
  description: string | null;
  speaker_id: string;
  title: string;
  updated_at: Generated<Timestamp>;
  youtube_playlist_id: string;
}

export interface ReadingProgress {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  last_read_paragraph: number | null;
  latest_read_paragraph: number;
  lesson_id: string | null;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface RefreshTokens {
  created_at: Generated<Timestamp>;
  expires_at: Timestamp;
  id: Generated<string>;
  token: string;
  user_id: string;
}

export interface Speakers {
  bio: string | null;
  created_at: Generated<Timestamp>;
  en_name: string;
  id: Generated<string>;
  image_key: string | null;
  name: string;
  updated_at: Generated<Timestamp>;
}

export interface Users {
  created_at: Generated<Timestamp>;
  email: string;
  id: Generated<string>;
  name: string | null;
  password_hash: string;
  updated_at: Generated<Timestamp>;
}

export interface YoutubeVideos {
  audio_backup_key: string | null;
  created_at: Generated<Timestamp>;
  playlist_id: string | null;
  speaker_id: string | null;
  updated_at: Generated<Timestamp>;
  youtube_video_id: string;
}

export interface DB {
  generation_jobs: GenerationJobs;
  highlights: Highlights;
  lessons: Lessons;
  note_tags: NoteTags;
  notes: Notes;
  notes_tags: NotesTags;
  playlists: Playlists;
  reading_progress: ReadingProgress;
  refresh_tokens: RefreshTokens;
  speakers: Speakers;
  users: Users;
  youtube_videos: YoutubeVideos;
}
