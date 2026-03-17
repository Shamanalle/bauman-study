"""
Extract text from all PDF files in new_sources/ directory.
Creates .txt files alongside each PDF with page-delimited format:
  --- Page N ---
  {page text}

Usage: python scripts/extract-pdf-text.py
"""

import os
import sys
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import fitz  # PyMuPDF

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)
NEW_SOURCES = os.path.join(ROOT, "new_sources")


def extract_pdf_text(pdf_path):
    """Extract text from a PDF file, returning page-delimited string."""
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc, 1):
        text = page.get_text("text").strip()
        pages.append(f"--- Page {i} ---\n{text}")
    doc.close()
    return "\n\n".join(pages) + "\n"


def main():
    if not os.path.isdir(NEW_SOURCES):
        print(f"[ERROR] Directory not found: {NEW_SOURCES}")
        sys.exit(1)

    extracted = 0
    skipped = 0
    empty = 0
    errors = 0

    for dirpath, _dirnames, filenames in os.walk(NEW_SOURCES):
        for filename in sorted(filenames):
            if not filename.lower().endswith(".pdf"):
                if filename.lower().endswith(".djvu"):
                    print(f"  [SKIP] .djvu: {filename}")
                    skipped += 1
                continue

            pdf_path = os.path.join(dirpath, filename)
            txt_path = os.path.splitext(pdf_path)[0] + ".txt"

            # Relative path for display
            rel = os.path.relpath(pdf_path, NEW_SOURCES)

            try:
                text = extract_pdf_text(pdf_path)
                if len(text.strip()) < 20:
                    print(f"  [WARN] Empty/scanned: {rel}")
                    empty += 1
                    # Still write the file, but note it
                
                with open(txt_path, "w", encoding="utf-8") as f:
                    f.write(text)

                extracted += 1
                print(f"  [OK] {rel}")
            except Exception as e:
                print(f"  [ERR] {rel} - {e}")
                errors += 1

    print(f"\n{'=' * 50}")
    print(f"[DONE] Extracted: {extracted}")
    if empty:
        print(f"[WARN] Empty/scanned (written but may lack text): {empty}")
    if skipped:
        print(f"[SKIP] Skipped (.djvu): {skipped}")
    if errors:
        print(f"[ERR] Errors: {errors}")


if __name__ == "__main__":
    main()
