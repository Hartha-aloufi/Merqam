# YouTube Arabic Subtitle Generator

A command-line tool to download and convert YouTube video subtitles to SRT and TXT formats. This tool is specifically designed to handle Arabic subtitles, including auto-generated ones.

## Features

-   Downloads Arabic subtitles from YouTube videos
-   Supports both manual and auto-generated Arabic subtitles
-   Converts subtitles to both SRT and TXT formats
-   Cross-platform support (Windows, Linux, macOS)

## Prerequisites

-   Python 3.x
-   Required Python packages (installed automatically):
    -   youtube-transcript-api
    -   pyinstaller

## Usage

The tool can be used in two ways:

### 1. As a Standalone Binary

```bash
main.exe <video_id> <output_dir>
```

Example:

```bash
main.exe yB1WtN6Kzqw ./output
```

### 2. As a Python Script

```bash
python main.py <video_id> <output_dir>
```

## Output

The tool generates two files:

1. `<video_id>.srt` - Subtitle file in SRT format with timing information
2. `<video_id>.txt` - Plain text file with just the subtitle text

## Building from Source

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Build using PyInstaller:

```bash
pyinstaller --onefile main.py
```

The compiled binary will be available in the `dist` directory.

## Integration

This tool is part of the [lessons-worker](../../README.md) package and is used for downloading Arabic subtitles from YouTube videos for further processing.
