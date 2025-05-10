import sys
import datetime

from youtube_transcript_api import YouTubeTranscriptApi
import os

def format_srt_time(seconds):
    return str(datetime.timedelta(seconds=seconds)).replace('.', ',') + '0'*(11 - len(str(datetime.timedelta(seconds=seconds)).replace('.', ',')))

if len(sys.argv) < 2:
    print("Usage: python generate_srt.py <video_id>")
    sys.exit(1)

video_id = sys.argv[1]
# output_dir = "C:\\Users\\month\\workspace\\Merqam\\packages\\lessons-worker\\temp"
output_dir = sys.argv[2] 

# Paths for both files
srt_path = os.path.join(output_dir, f"{video_id}.srt")
txt_path = os.path.join(output_dir, f"{video_id}.txt")

# Check if either file already exists
if os.path.exists(srt_path) or os.path.exists(txt_path):
    print(f"Error: One of the output files already exists.\nSRT: {srt_path}\nTXT: {txt_path}\nPlease remove it before running the script again.")
    sys.exit(1)

try:
    transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['ar'])

    with open(srt_path, "w", encoding="utf-8") as srt_file, open(txt_path, "w", encoding="utf-8") as txt_file:
        for i, entry in enumerate(transcript, start=1):
            start = format_srt_time(entry['start'])
            end = format_srt_time(entry['start'] + entry['duration'])
            text = entry['text']

            # Write to SRT
            srt_file.write(f"{i}\n{start} --> {end}\n{text}\n\n")

            # Write to TXT (only text)
            txt_file.write(f"{text}\n")

    print(f"SRT file generated: {srt_path}")
    print(f"TXT file generated: {txt_path}")

except Exception as e:
    print("Error:", e)
