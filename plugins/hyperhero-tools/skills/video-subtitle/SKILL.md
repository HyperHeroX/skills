---
name: video-subtitle
description: |
  **Video Subtitle Generator**: Generate Traditional Chinese (繁體中文) SRT subtitle files from video/audio using faster-whisper speech recognition with GPU acceleration.
  - MANDATORY TRIGGERS: subtitle, subtitles, 字幕, .srt, transcribe video, transcribe audio, speech to text, 語音辨識, 語音轉文字, 影片字幕, video transcription, whisper
  - Also trigger when: user mentions adding captions to a video, wants to convert speech in a video to text, or needs to create subtitle files from any media file (.mp4, .mkv, .avi, .wav, .mp3, etc.)
---

# Video Subtitle Generator

Generate high-quality Traditional Chinese subtitle files (.srt) from video or audio files using the `faster-whisper` speech recognition engine. This skill captures hard-won lessons from real-world subtitle generation, including GPU setup pitfalls, model selection trade-offs, and common Traditional Chinese transcription error patterns.

## Architecture Overview

The workflow has four phases:

1. **Audio Extraction** — Use ffmpeg to extract mono 16kHz WAV audio from the source video
2. **Speech Recognition** — Use faster-whisper to transcribe audio into timestamped segments
3. **SRT Generation** — Format segments into standard SRT subtitle format with UTF-8 BOM
4. **Post-Processing** — Correct common Whisper transcription errors in Traditional Chinese

## Environment Setup

### Dependencies

- **ffmpeg**: For audio extraction (usually pre-installed on most systems)
- **faster-whisper**: Python speech recognition library (lightweight alternative to openai-whisper)
- **nvidia-cublas-cu12** + **nvidia-cudnn-cu12**: Required for GPU acceleration (only if NVIDIA GPU available)

### Installation on Windows

When working with Windows via PowerShell/MCP tools, use the full Python path to avoid virtual environment conflicts. Many Windows systems have multiple Python installations; the `where.exe python` and `where.exe pip` commands help identify which is active.

```bash
# Install faster-whisper to the target Python
"C:\path\to\python.exe" -m pip install faster-whisper

# For GPU support, also install CUDA libraries
"C:\path\to\python.exe" -m pip install nvidia-cublas-cu12 nvidia-cudnn-cu12
```

**Critical GPU gotcha**: After installing `nvidia-cublas-cu12` and `nvidia-cudnn-cu12` via pip, the DLLs are buried inside the Python `site-packages/nvidia/` directory. CTranslate2 (faster-whisper's backend) cannot find them without PATH configuration. You MUST set the PATH before launching the transcription script:

```bat
set PATH=<python-site-packages>\nvidia\cublas\bin;<python-site-packages>\nvidia\cudnn\bin;%PATH%
```

Find the exact DLL paths with:
```powershell
Get-ChildItem "<python-site-packages>\nvidia" -Recurse -Filter "cublas64_12.dll"
```

### Installation on Linux

```bash
pip install faster-whisper --break-system-packages
# or with --target if disk space is limited on root partition
pip install faster-whisper --target=/path/with/space/pylibs
```

If root filesystem space is limited, install to an alternative directory using `--target` and set `PYTHONPATH` accordingly.

## Phase 1: Audio Extraction

Extract audio as mono 16kHz WAV (optimal for Whisper models):

```bash
ffmpeg -i "input_video.mp4" -vn -acodec pcm_s16le -ar 16000 -ac 1 "output_audio.wav" -y
```

For large files on network shares, this can take time. Run in background if using Windows:

```bat
start /b ffmpeg -i "input.mp4" -vn -acodec pcm_s16le -ar 16000 -ac 1 "%TEMP%\audio.wav" -y
```

**Tip**: For a 600MB video, the extracted WAV will be roughly 400MB (uncompressed 16kHz mono). Plan disk space accordingly.

## Phase 2: Model Selection

| Model | Size | Speed (GPU) | Speed (CPU) | Chinese Quality |
|-------|------|-------------|-------------|-----------------|
| large-v3 | ~3GB | Fast | Very slow | Best |
| medium | ~1.5GB | Very fast | Slow | Very good |
| small | ~500MB | Fastest | Moderate | Good |

**Recommended**: Use `medium` model as default. It provides the best balance of quality and speed for Traditional Chinese. The `large-v3` model is impractically slow on CPU for long videos (a 3.5-hour video could take 2+ hours on CPU with large-v3, but only ~8 minutes on GPU with medium).

### GPU vs CPU Performance

For a 3.5-hour ISC2 lecture video (real benchmark):

- **GPU (RTX 2080 Ti, medium model, float16)**: ~8 minutes total
- **CPU (medium model, int8)**: ~70 minutes estimated
- **CPU (large-v3, int8)**: 2+ hours estimated

Always prefer GPU when available. Check with:
```python
# Python
import ctranslate2
print(ctranslate2.get_cuda_device_count())  # >0 means GPU available
```

Or via command line:
```bash
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
```

## Phase 3: Transcription Script

Here is the reference transcription script. Adapt paths as needed:

```python
import sys
import os
from faster_whisper import WhisperModel

audio_path = "path/to/audio.wav"
output_path = "path/to/output.srt"

# Try GPU first, fall back to CPU
print("Loading model...", flush=True)
try:
    model = WhisperModel("medium", device="cuda", compute_type="float16")
    print("Using GPU (CUDA)", flush=True)
except Exception as e:
    print(f"GPU failed ({e}), falling back to CPU...", flush=True)
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    print("Using CPU", flush=True)

print("Transcribing...", flush=True)
segments, info = model.transcribe(
    audio_path,
    language="zh",          # Force Chinese detection
    beam_size=5,            # Higher = better quality, slower
    word_timestamps=False,  # Not needed for SRT
    vad_filter=True,        # Voice Activity Detection filters silence
    vad_parameters=dict(min_silence_duration_ms=500)
)

print(f"Detected language: {info.language} (prob: {info.language_probability:.2f})", flush=True)

def format_timestamp(seconds):
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

count = 0
# UTF-8 with BOM for maximum player compatibility
with open(output_path, "w", encoding="utf-8-sig") as f:
    for segment in segments:
        count += 1
        start = format_timestamp(segment.start)
        end = format_timestamp(segment.end)
        text = segment.text.strip()
        f.write(f"{count}\n")
        f.write(f"{start} --> {end}\n")
        f.write(f"{text}\n\n")
        f.flush()  # Flush each segment so progress is visible
        if count % 100 == 0:
            print(f"  Processed {count} segments...", flush=True)

print(f"Done! Total segments: {count}", flush=True)
```

**Key parameters explained**:
- `language="zh"`: Forces Chinese; without this, Whisper may misdetect language on short segments
- `vad_filter=True`: Silverbullet for long recordings — skips silence, dramatically reducing processing time
- `encoding="utf-8-sig"`: BOM marker ensures compatibility with Windows media players
- `f.flush()`: Critical for monitoring progress on long transcriptions; without it, output appears only at the end

## Phase 4: Post-Processing — Traditional Chinese Error Correction

Whisper frequently makes specific categories of errors when transcribing Traditional Chinese, especially for domain-specific content. Below are the most common patterns observed and their corrections.

### Category 1: Homophone Confusion (同音字/近音字)

These are the most common errors. Whisper picks characters that sound similar but have wrong meaning:

| Error | Correction | Context |
|-------|-----------|---------|
| 自安 | 資安 | 資訊安全 (Information Security) |
| 憲進 | 先進 | 敬稱 (respectful address) |
| 書法部 / 蘇巴布 | 數發部 | 數位發展部 (Ministry of Digital Affairs) |
| 畢信 | 敝姓 | 自我介紹 (self-introduction) |
| 制裁權 | 著作權 | 智慧財產 (copyright context) |
| 完成性 | 完整性 | 資料完整性 (data integrity) |
| 結洽 | 接洽 | 合作接洽 (liaison) |
| 猜法 / 猜罰 | 裁罰 | 法律裁罰 (legal penalty) |
| 供給 | 攻擊 | 資安攻擊 context |

### Category 2: Proper Noun Garbling (專有名詞)

Whisper struggles with organization names and technical terms in Chinese:

| Error | Correction | What it is |
|-------|-----------|------------|
| 公園醫院自通所 | 工研院資通所 | ITRI ICL |
| 公其郡/宮崎駿 | 宮崎駿 | Miyazaki (Studio Ghibli) |
| 基普力/吉普利 | 吉卜力 | Studio Ghibli |
| 甲進門 | 賈靜雯 | Celebrity name |
| 陳奕涵 | 陳奕迅 | Celebrity name |

### Category 3: Technical Term Corruption (技術術語)

English technical terms often get corrupted, especially when mixed with Chinese:

| Error | Correction |
|-------|-----------|
| OASP | OWASP |
| Bronin Json | Prompt Injection |
| Sequence Json | SQL Injection |
| Deepflag | Deepfake |
| Jet Brakes | Jailbreak |
| Cross-Side Request Forage | Cross-Site Request Forgery |
| Interact Brown Injection | Indirect Prompt Injection |
| Large Length Model | Large Language Model |
| Prom (truncated) | Prompt |
| MCPCLI | MCP、CLI |

### Category 4: Context-Dependent Errors

Some words need contextual judgment:

- **供給 vs 攻擊**: In security contexts, "供給" (supply) is often a misrecognition of "攻擊" (attack). Look for patterns like "供給威脅", "對抗式樣本供給", "供給的貼紙"
- **生成是 vs 生成式**: "生成是AI" should be "生成式AI" (Generative AI)
- **人眼 vs 人臉**: "人眼識別" should be "人臉識別" (facial recognition)

### Correction Script Pattern

Use a Python script with ordered replacements (longer/more specific patterns first to avoid partial matches):

```python
replacements = [
    # Longer patterns first to avoid partial match issues
    ("Interact Brown Injection Attack", "Indirect Prompt Injection Attack"),
    ("Cross-Side Request Forage", "Cross-Site Request Forgery"),
    # Then shorter patterns
    ("OASP", "OWASP"),
    ("Deepflag", "Deepfake"),
    # Chinese corrections
    ("公園醫院自通所", "工研院資通所"),
    ("書法部", "數發部"),
    # ...
]

for old, new in replacements:
    content = content.replace(old, new)
```

For regex-based corrections (e.g., truncated words at line boundaries):
```python
import re
content = re.sub(r"攻擊的Prom\b", "攻擊的Prompt", content)
content = re.sub(r"System Prom\b", "System Prompt", content)
```

## Troubleshooting

### "No space left on device" during pip install
The Linux VM root partition may be small. Use `--target` to install to a larger partition:
```bash
pip install faster-whisper --target=/sessions/work/pylibs
export PYTHONPATH=/sessions/work/pylibs:$PYTHONPATH
```

### "cublas64_12.dll is not found" on Windows GPU
Install CUDA pip packages AND set PATH. This is the #1 GPU setup failure:
```bat
pip install nvidia-cublas-cu12 nvidia-cudnn-cu12
set PATH=...\nvidia\cublas\bin;...\nvidia\cudnn\bin;%PATH%
```

### PowerShell timeouts on long-running commands
Use background execution with batch files for operations > 30 seconds:
```powershell
Start-Process "run_script.bat" -WindowStyle Hidden
# Then poll for completion
```

### Multiple Python installations on Windows
The `python` command may resolve to a virtual environment Python (e.g., Windows MCP .venv). Always verify with `where.exe python` and use full paths:
```powershell
& "C:\Users\...\Python313\python.exe" -m pip install faster-whisper
```

### Network share access
When source video is on a NAS/network share, ffmpeg can read directly from UNC paths:
```bash
ffmpeg -i "\\NAS\Video\input.mp4" ...
```
But transcription should use a local copy of the extracted audio for better performance.

## Output Format

The skill produces standard SRT files:
```
1
00:00:00,660 --> 00:00:02,660
對，沒問題

2
00:00:02,660 --> 00:00:04,660
好，謝謝您
```

SRT files are saved with:
- UTF-8 encoding with BOM (utf-8-sig) for Windows player compatibility
- Same filename as the video but with .srt extension
- Placed in the same directory as the source video (for auto-loading by media players)
