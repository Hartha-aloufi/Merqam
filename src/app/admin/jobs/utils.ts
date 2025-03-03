import { db } from "@/server/config/db";

export async function extractYoutubeId(url: string): Promise<string> {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match?.[1] ?? '';
}

export const validateIsVideoNotInDatabase = async (url: string) => {
  const videoId = await extractYoutubeId(url);

  const existingVideo = await db
    .selectFrom('lessons')
    .where('youtube_video_id', '=', videoId)
    .executeTakeFirst();

  if (existingVideo) {
    throw new Error('هذا الفيديو موجود بالفعل');
  }
};
