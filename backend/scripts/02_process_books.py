#!/usr/bin/env python3
"""
Process raw book files.
This script reads books.json, splits text into chapters, and saves processed books.
"""

import json
import re
from pathlib import Path

def detect_chapter_pattern(text):
    """Detect the most common chapter heading pattern in the text."""
    patterns = [
        r'^Chapter \d+',           # Chapter 1, Chapter 2, etc.
        r'^Chapter [IVX]+',        # Chapter I, Chapter II, etc.
        r'^CHAPTER \d+',           # CHAPTER 1, CHAPTER 2, etc.
        r'^CHAPTER [IVX]+',        # CHAPTER I, CHAPTER II, etc.
        r'^\d+\.',                 # 1., 2., 3., etc.
        r'^[IVX]+\.',              # I., II., III., etc.
        r'^Part \d+',              # Part 1, Part 2, etc.
        r'^Book \d+',              # Book 1, Book 2, etc.
    ]
    
    lines = text.split('\n')
    pattern_counts = {}
    
    for pattern in patterns:
        count = 0
        for line in lines:
            line = line.strip()
            if re.match(pattern, line, re.IGNORECASE):
                count += 1
        pattern_counts[pattern] = count
    
    # Return the pattern with the most matches (minimum 2 to be valid)
    best_pattern = max(pattern_counts, key=pattern_counts.get)
    if pattern_counts[best_pattern] >= 2:
        return best_pattern
    
    return None

def split_into_chapters(text, book_title):
    """Split book text into chapters based on detected patterns."""
    if not text or not text.strip():
        return []
    
    # Detect the chapter pattern
    chapter_pattern = detect_chapter_pattern(text)
    
    if not chapter_pattern:
        print(f"  No chapter pattern detected for '{book_title}', treating as single chapter")
        return [{
            "title": "Full Text",
            "content": text.strip()
        }]
    
    print(f"  Using chapter pattern: {chapter_pattern}")
    
    # Split the text using the detected pattern
    lines = text.split('\n')
    chapters = []
    current_chapter = None
    current_content = []
    
    for line in lines:
        stripped_line = line.strip()
        
        # Check if this line matches our chapter pattern
        if re.match(chapter_pattern, stripped_line, re.IGNORECASE):
            # Save the previous chapter if it exists
            if current_chapter and current_content:
                chapters.append({
                    "title": current_chapter,
                    "content": '\n'.join(current_content).strip()
                })
            
            # Start a new chapter
            current_chapter = stripped_line
            current_content = []
        else:
            # Add to current chapter content
            if current_chapter:  # Only add content if we've found a chapter
                current_content.append(line)
    
    # Don't forget the last chapter
    if current_chapter and current_content:
        chapters.append({
            "title": current_chapter,
            "content": '\n'.join(current_content).strip()
        })
    
    # If no chapters were found but we detected a pattern, treat as single chapter
    if not chapters:
        chapters.append({
            "title": "Full Text",
            "content": text.strip()
        })
    
    print(f"  Split into {len(chapters)} chapters")
    return chapters

def clean_chapter_content(content):
    """Clean up chapter content - remove extra whitespace, etc."""
    if not content:
        return ""
    
    # Remove excessive whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)  # Max 2 consecutive newlines
    content = re.sub(r'[ \t]+', ' ', content)  # Multiple spaces/tabs to single space
    content = content.strip()
    
    return content

def process_books():
    """Main processing function."""
    # Paths
    input_file = Path(__file__).parent.parent / "data" / "raw" / "books.json"
    output_dir = Path(__file__).parent.parent / "data" / "export"
    output_file = output_dir / "books_processed.json"
    
    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file {input_file} not found!")
        print("Please run 01_fetch_books.py first to create the raw books data.")
        return
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load the raw books data
    print(f"Loading books from {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        books_data = json.load(f)
    
    print(f"Processing {len(books_data)} books...")
    
    processed_books = []
    
    for i, book in enumerate(books_data):
        print(f"\nProcessing {i+1}/{len(books_data)}: {book.get('title', 'Unknown Title')}")
        
        # Get book metadata
        book_id = book.get('id')
        title = book.get('title', 'Unknown Title')
        author = book.get('author', 'Unknown Author')
        text = book.get('text', '')
        
        # Split text into chapters
        chapters = split_into_chapters(text, title)
        
        # Clean up chapter content
        cleaned_chapters = []
        for chapter in chapters:
            cleaned_content = clean_chapter_content(chapter['content'])
            if cleaned_content:  # Only include non-empty chapters
                cleaned_chapters.append({
                    "title": chapter['title'],
                    "content": cleaned_content
                })
        
        # Create processed book object
        processed_book = {
            "id": book_id,
            "title": title,
            "author": author,
            "chapters": cleaned_chapters
        }
        
        processed_books.append(processed_book)
        print(f"  Successfully processed with {len(cleaned_chapters)} chapters")
    
    # Save processed books
    print(f"\nSaving processed books to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(processed_books, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully processed {len(processed_books)} books!")
    print(f"📁 Output saved to: {output_file}")

def main():
    """Main function."""
    print("Starting book processing...")
    process_books()

if __name__ == "__main__":
    main()