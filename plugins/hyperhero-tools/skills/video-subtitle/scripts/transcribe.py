#!/usr/bin/env python3
"""
Video/Audio to SRT subtitle generator using faster-whisper.
Supports GPU (CUDA) with automatic fallback to CPU.

Usage:
    python transcribe.py <audio_or_video_path> [--output <output.srt>] [--model medium] [--language zh]
"""

import argparse
import os
import sys
import subprocess
import tempfile


def extract_audio(input_path, output_path):
    """Extract mono 16kHz WAV audio from video using ffmpeg."""
    print(f"Extracting audio from: {input_path}", flush=True)
    cmd = [
        "ffmpeg", "-i", input_path,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        output_path, "-y"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"ffmpeg error: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    print(f"Audio extracted: {output_path}", flush=True)


def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format HH:MM:SS,mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def transcribe(audio_path, output_path, model_name="medium", language="zh"):
    """Transcribe audio to SRT using faster-whisper."""
    from faster_whisper import WhisperModel

    # Try GPU first, fall back to CPU
    print(f"Loading model ({model_name})...", flush=True)
    try:
        model = WhisperModel(model_name, device="cuda", compute_type="float16")
        print("Using GPU (CUDA)", flush=True)
    except Exception as e:
        print(f"GPU unavailable ({e}), using CPU...", flush=True)
        model = WhisperModel(model_name, device="cpu", compute_type="int8")
        print("Using CPU (this may be slow for long files)", flush=True)

    print("Transcribing...", flush=True)
    segments, info = model.transcribe(
        audio_path,
        language=language,
        beam_size=5,
        word_timestamps=False,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500)
    )

    print(f"Detected language: {info.language} (prob: {info.language_probability:.2f})", flush=True)

    count = 0
    with open(output_path, "w", encoding="utf-8-sig") as f:
        for segment in segments:
            count += 1
            start = format_timestamp(segment.start)
            end = format_timestamp(segment.end)
            text = segment.text.strip()
            f.write(f"{count}\n")
            f.write(f"{start} --> {end}\n")
            f.write(f"{text}\n\n")
            f.flush()
            if count % 100 == 0:
                print(f"  Processed {count} segments...", flush=True)

    print(f"Done! Total segments: {count}", flush=True)
    print(f"Output: {output_path}", flush=True)
    return count


def main():
    parser = argparse.ArgumentParser(description="Generate SRT subtitles from video/audio")
    parser.add_argument("input", help="Path to video or audio file")
    parser.add_argument("--output", "-o", help="Output SRT path (default: same name as input with .srt)")
    parser.add_argument("--model", "-m", default="medium", choices=["tiny", "base", "small", "medium", "large-v3"],
                        help="Whisper model size (default: medium)")
    parser.add_argument("--language", "-l", default="zh", help="Language code (default: zh for Chinese)")
    args = parser.parse_args()

    input_path = args.input
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # Determine output path
    if args.output:
        output_path = args.output
    else:
        base, _ = os.path.splitext(input_path)
        output_path = base + ".srt"

    # Check if input is video (needs audio extraction) or audio
    audio_extensions = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".aac"}
    _, ext = os.path.splitext(input_path)

    if ext.lower() in audio_extensions:
        audio_path = input_path
    else:
        # Extract audio to temp file
        temp_dir = tempfile.gettempdir()
        audio_path = os.path.join(temp_dir, "whisper_extracted_audio.wav")
        extract_audio(input_path, audio_path)

    # Transcribe
    count = transcribe(audio_path, output_path, args.model, args.language)

    # Cleanup temp audio if we extracted it
    if audio_path != input_path and os.path.exists(audio_path):
        os.remove(audio_path)
        print("Cleaned up temporary audio file", flush=True)

    print(f"\nSubtitle file saved: {output_path} ({count} segments)")


if __name__ == "__main__":
    main()
