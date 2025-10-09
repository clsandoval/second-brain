#!/bin/bash

# Script to download YouTube video transcripts using yt-dlp
# Usage: ./download-transcript.sh <youtube_url> [output_file]

# Check if URL is provided
if [ $# -eq 0 ]; then
    echo "Error: No YouTube URL provided"
    echo "Usage: $0 <youtube_url> [output_file]"
    exit 1
fi

URL="$1"
OUTPUT="${2:-transcript}"

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "Error: yt-dlp is not installed"
    echo "Install it with: pip install --user yt-dlp"
    exit 1
fi

# Download transcript
echo "Downloading transcript from: $URL"

# Download subtitles and convert to SRT format (most compatible)
yt-dlp --write-subs --write-auto-subs --skip-download --sub-lang en --convert-subs srt --output "$OUTPUT" "$URL"

if [ $? -ne 0 ]; then
    echo "Failed to download transcript"
    echo "The video may not have captions available or the video may be private/restricted"
    exit 1
fi

# Find the downloaded transcript file
TRANSCRIPT_FILE=""
for lang in en en-US en-GB; do
    if [ -f "${OUTPUT}.${lang}.srt" ]; then
        TRANSCRIPT_FILE="${OUTPUT}.${lang}.srt"
        break
    fi
done

if [ -z "$TRANSCRIPT_FILE" ]; then
    echo "Transcript file not found after download"
    exit 1
fi

echo "Transcript downloaded successfully: $TRANSCRIPT_FILE"

# Convert SRT to plain text
echo "Converting to plain text..."

# Determine which Python command to use
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    if command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        echo "Error: Python is not installed"
        exit 1
    fi
fi

$PYTHON_CMD -c "
import re
import sys

try:
    with open('$TRANSCRIPT_FILE', 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove subtitle numbering
    content = re.sub(r'^\d+\s*$', '', content, flags=re.MULTILINE)

    # Remove timestamps (format: 00:00:00,000 --> 00:00:00,000)
    content = re.sub(r'\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}', '', content)

    # Remove HTML tags
    content = re.sub(r'<[^>]+>', '', content)

    # Remove extra whitespace and empty lines
    lines = [line.strip() for line in content.split('\n') if line.strip()]

    # Join with spaces
    plain_text = ' '.join(lines)

    # Clean up multiple spaces
    plain_text = re.sub(r'\s+', ' ', plain_text).strip()

    # Write to plain text file
    output_txt = '${OUTPUT}.txt'
    with open(output_txt, 'w', encoding='utf-8') as f:
        f.write(plain_text)

    print(f'Converted to plain text: {output_txt}')
    print(f'Text length: {len(plain_text)} characters')
except Exception as e:
    print(f'Error converting SRT: {e}', file=sys.stderr)
    sys.exit(1)
"

if [ $? -eq 0 ]; then
    echo ""
    echo "Files created:"
    echo "  - $TRANSCRIPT_FILE (SRT format)"
    echo "  - ${OUTPUT}.txt (plain text)"
    exit 0
else
    echo "Failed to convert transcript to plain text"
    exit 1
fi
