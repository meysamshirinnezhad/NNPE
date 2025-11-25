#!/usr/bin/env python3
"""
Collect code files (with paths) from a folder and all subfolders into one text file.

Usage:
  python collect_code.py --root /path/to/root --out collected_code.txt \
    --ext .py .js .ts .tsx .jsx .go .rs .cpp .cc .cxx .c .h .hpp .java .kt .m .mm .swift \
    .rb .php .sh .ps1 .bat .sql .R .scala .pl .lua .hs .cs .css .scss .less .html .htm .xml .yml .yaml .json

Notes:
- Recursively scans subfolders.
- Writes each file as:
    ===== BEGIN FILE =====
    PATH: /abs/path/to/file
    ---- CONTENT ----
    <file content>
    ===== END FILE =====
- Gracefully handles encoding errors (replaces invalid chars).
- Skips binary-ish or huge files if you set --max-bytes.
"""

import argparse
import os
from pathlib import Path

DEFAULT_EXTS = [
    ".py",".js",".ts",".tsx",".jsx",
    ".go",".rs",".cpp",".cc",".cxx",".c",".h",".hpp",
    ".java",".kt",".m",".mm",".swift",
    ".rb",".php",".sh",".ps1",".bat",
    ".sql",".R",".scala",".pl",".lua",".hs",".cs",
    ".css",".scss",".less",".html",".htm",".xml",
    ".yml",".yaml",".json",".toml",".ini",".cfg",".conf",".md"
]

SEPARATOR_BEGIN = "===== BEGIN FILE ====="
SEPARATOR_END = "===== END FILE ====="
CONTENT_MARK = "---- CONTENT ----"

def is_probably_text(path: Path, max_nulls: int = 0) -> bool:
    """Quick check to avoid obvious binary files by scanning a small chunk."""
    try:
        with path.open("rb") as f:
            chunk = f.read(4096)
        # If there are NUL bytes, likely binary
        return chunk.count(b"\x00") <= max_nulls
    except Exception:
        return False

def collect_files(root: Path, exts: set[str], max_bytes: int | None) -> list[Path]:
    files: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        # (Optional) skip hidden dirs; comment out if you want to include them
        # dirnames[:] = [d for d in dirnames if not d.startswith(".")]
        for name in filenames:
            p = Path(dirpath) / name
            if exts:
                if p.suffix.lower() not in exts:
                    continue
            # Size filter
            try:
                if max_bytes is not None and p.stat().st_size > max_bytes:
                    continue
            except Exception:
                continue
            # Binary-ish filter
            if not is_probably_text(p):
                continue
            files.append(p)
    return files

def main():
    ap = argparse.ArgumentParser(description="Collect code files and their paths.")
    ap.add_argument("--root", type=Path, required=True, help="Root folder to scan.")
    ap.add_argument("--out", type=Path, required=True, help="Output text file base name.")
    ap.add_argument("--ext", nargs="*", default=DEFAULT_EXTS,
                    help="File extensions to include (e.g., .py .js .ts). Case-insensitive.")
    ap.add_argument("--encoding", default="utf-8",
                    help="Preferred encoding to read files (default: utf-8).")
    ap.add_argument("--max-bytes", type=int, default=None,
                    help="Skip files larger than this many bytes (optional).")
    ap.add_argument("--max-lines", type=int, default=6000,
                    help="Maximum lines per output file (default: 6000).")
    args = ap.parse_args()

    root = args.root.resolve()
    out_base = args.out.resolve()
    exts = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in args.ext}

    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Root folder does not exist or is not a directory: {root}")

    files = collect_files(root, exts, args.max_bytes)
    files.sort(key=lambda p: str(p).lower())

    out_base.parent.mkdir(parents=True, exist_ok=True)
    count_written = 0
    file_index = 1
    current_lines = 0
    current_out = None

    def get_out_path(index):
        stem = out_base.stem
        suffix = out_base.suffix
        return out_base.parent / f"{stem}_{index}{suffix}"

    def start_new_file():
        nonlocal current_out, current_lines, file_index
        if current_out:
            current_out.close()
        current_out = get_out_path(file_index).open("w", encoding="utf-8", newline="\n")
        current_lines = 0
        file_index += 1

    start_new_file()

    for p in files:
        try:
            # Try preferred encoding, fall back to latin-1 with replacement
            try:
                text = p.read_text(encoding=args.encoding, errors="replace")
            except Exception:
                text = p.read_text(encoding="latin-1", errors="replace")
            # Calculate lines this file would add
            file_lines = text.count('\n') + 4  # BEGIN, PATH, CONTENT, END + 2 extra
            if not text.endswith('\n'):
                file_lines += 1  # for the added newline
            # If adding this file would exceed max_lines, start new file
            if current_lines + file_lines > args.max_lines:
                start_new_file()
            out = current_out
            out.write(f"{SEPARATOR_BEGIN}\n")
            out.write(f"PATH: {p.resolve()}\n")
            out.write(f"{CONTENT_MARK}\n")
            out.write(text)
            # Ensure trailing newline before closing block for readability
            if not text.endswith("\n"):
                out.write("\n")
            out.write(f"{SEPARATOR_END}\n\n")
            current_lines += file_lines
            count_written += 1
        except Exception as e:
            # Skip unreadable files but keep going
            file_lines = 4  # BEGIN, PATH, CONTENT, END + error
            if current_lines + file_lines > args.max_lines:
                start_new_file()
            out = current_out
            out.write(f"{SEPARATOR_BEGIN}\nPATH: {p.resolve()}\n{CONTENT_MARK}\n")
            out.write(f"[ERROR READING FILE: {e}]\n{SEPARATOR_END}\n\n")
            current_lines += file_lines

    if current_out:
        current_out.close()

    print(f"Collected {count_written} file(s) into {file_index-1} output file(s) starting with: {get_out_path(1)}")

if __name__ == "__main__":
    main()
