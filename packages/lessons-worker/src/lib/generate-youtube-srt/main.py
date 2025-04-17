import sys
from youtube_transcript_api import YouTubeTranscriptApi
import json

def main():
    if len(sys.argv) != 3:
        print("Usage: script.py <video_id> <output_dir>")
        sys.exit(1)

    video_id = sys.argv[1]
    output_dir = sys.argv[2]

    try:
        # Try to get Arabic subtitles first, fall back to auto-generated if not available
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['ar'])
        except:
            # If Arabic not available, try auto-generated Arabic
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['ar'], preserve_formatting=True)
        
        # Save as SRT
        with open(f"{output_dir}/{video_id}.srt", "w", encoding="utf-8") as srt_file:
            for i, entry in enumerate(transcript, 1):
                start = int(entry['start'])
                duration = int(entry['duration'])
                end = start + duration
                
                # Convert to SRT format
                start_time = f"{start//3600:02d}:{(start%3600)//60:02d}:{start%60:02d},000"
                end_time = f"{end//3600:02d}:{(end%3600)//60:02d}:{end%60:02d},000"
                
                srt_file.write(f"{i}\n")
                srt_file.write(f"{start_time} --> {end_time}\n")
                srt_file.write(f"{entry['text']}\n\n")
        
        # Save as TXT
        with open(f"{output_dir}/{video_id}.txt", "w", encoding="utf-8") as txt_file:
            for entry in transcript:
                txt_file.write(f"{entry['text']}\n")

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 