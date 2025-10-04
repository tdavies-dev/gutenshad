#!/usr/bin/env python3
"""
Export book data to JSON format.
This script exports processed book data from the database to JSON files.
Creates individual JSON files per book and a manifest file.
"""

import sqlite3
import json
import re
from pathlib import Path

def sanitize_filename(text):
    """Sanitize text for use as filename."""
    # Replace spaces and special chars with underscores
    text = re.sub(r'[^\w\s-]', '', text)  # Remove special chars except spaces and hyphens
    text = re.sub(r'[-\s]+', '_', text)   # Replace spaces and hyphens with underscores
    text = text.lower().strip('_')        # Lowercase and remove leading/trailing underscores
    return text[:100]  # Limit length to avoid filesystem issues

def export_individual_books(cursor, output_dir):
    """Export each book as an individual JSON file."""
    print("Exporting individual book files...")
    
    # Get all books from database
    cursor.execute('''
        SELECT id, title, author, chapter_count 
        FROM books 
        ORDER BY title
    ''')
    books = cursor.fetchall()
    
    exported_files = []
    
    for book_id, title, author, chapter_count in books:
        print(f"  Exporting: {title} by {author}")
        
        # Get chapters for this book
        cursor.execute('''
            SELECT chapter_number, title, content 
            FROM chapters 
            WHERE book_id = ? 
            ORDER BY chapter_number
        ''', (book_id,))
        chapters_data = cursor.fetchall()
        
        # Build chapters list
        chapters = []
        for chapter_num, chapter_title, chapter_content in chapters_data:
            chapters.append({
                "title": chapter_title,
                "content": chapter_content
            })
        
        # Create book object
        book_data = {
            "id": book_id,
            "title": title,
            "author": author,
            "chapters": chapters
        }
        
        # Create filename
        filename = f"{sanitize_filename(title)}_{sanitize_filename(author)}.json"
        file_path = output_dir / filename
        
        # Write JSON file
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, indent=2, ensure_ascii=False)
            
            exported_files.append({
                "filename": filename,
                "book_id": book_id,
                "title": title,
                "author": author,
                "chapter_count": len(chapters)
            })
            
        except Exception as e:
            print(f"    ❌ Error exporting {title}: {e}")
            continue
    
    print(f"✅ Exported {len(exported_files)} individual book files")
    return exported_files

def create_manifest(exported_files, output_dir):
    """Create a manifest file listing all exported books."""
    print("Creating manifest file...")
    
    manifest = {
        "total_books": len(exported_files),
        "exported_at": "CURRENT_TIMESTAMP",
        "books": exported_files
    }
    
    manifest_path = output_dir / "manifest.json"
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created manifest: {manifest_path}")

def create_combined_export(cursor, output_dir):
    """Create a single JSON file with all books."""
    print("Creating combined books file...")
    
    # Get all books with chapters
    cursor.execute('''
        SELECT b.id, b.title, b.author
        FROM books b
        ORDER BY b.title
    ''')
    books = cursor.fetchall()
    
    all_books = []
    
    for book_id, title, author in books:
        # Get chapters for this book
        cursor.execute('''
            SELECT chapter_number, title, content 
            FROM chapters 
            WHERE book_id = ? 
            ORDER BY chapter_number
        ''', (book_id,))
        chapters_data = cursor.fetchall()
        
        # Build chapters list
        chapters = []
        for chapter_num, chapter_title, chapter_content in chapters_data:
            chapters.append({
                "title": chapter_title,
                "content": chapter_content
            })
        
        # Add to combined list
        all_books.append({
            "id": book_id,
            "title": title,
            "author": author,
            "chapters": chapters
        })
    
    # Write combined file
    combined_path = output_dir / "all_books.json"
    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(all_books, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created combined file: {combined_path}")

def export_database_stats(cursor, output_dir):
    """Export database statistics."""
    print("Exporting database statistics...")
    
    # Get stats from the book_stats view
    cursor.execute('SELECT * FROM book_stats ORDER BY total_words DESC')
    stats_data = cursor.fetchall()
    
    # Convert to list of dictionaries
    stats = []
    for row in stats_data:
        stats.append({
            "book_id": row[0],
            "title": row[1],
            "author": row[2],
            "chapter_count": row[3],
            "total_words": row[4],
            "avg_words_per_chapter": round(row[5], 2)
        })
    
    # Overall statistics
    cursor.execute('SELECT COUNT(*) FROM books')
    total_books = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM chapters')
    total_chapters = cursor.fetchone()[0]
    
    cursor.execute('SELECT SUM(word_count) FROM chapters')
    total_words = cursor.fetchone()[0] or 0
    
    statistics = {
        "summary": {
            "total_books": total_books,
            "total_chapters": total_chapters,
            "total_words": total_words,
            "avg_chapters_per_book": round(total_chapters / total_books, 2) if total_books > 0 else 0,
            "avg_words_per_book": round(total_words / total_books, 2) if total_books > 0 else 0
        },
        "books": stats
    }
    
    stats_path = output_dir / "statistics.json"
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(statistics, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Created statistics file: {stats_path}")

def export_json_data():
    """Main export function."""
    # Paths
    db_file = Path(__file__).parent.parent / "data" / "books.db"
    output_dir = Path(__file__).parent.parent / "data" / "export"
    
    # Check if database exists
    if not db_file.exists():
        print(f"❌ Error: Database file {db_file} not found!")
        print("Please run 03_populate_db.py first to create the database.")
        return
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Connect to database
    print(f"Connecting to database: {db_file}")
    try:
        with sqlite3.connect(db_file) as conn:
            cursor = conn.cursor()
            
            # Export individual book files
            exported_files = export_individual_books(cursor, output_dir)
            
            # Create manifest
            create_manifest(exported_files, output_dir)
            
            # Create combined export
            create_combined_export(cursor, output_dir)
            
            # Export statistics
            export_database_stats(cursor, output_dir)
            
            print(f"\n📁 Export Summary:")
            print(f"   📂 Output directory: {output_dir}")
            print(f"   📚 Individual book files: {len(exported_files)}")
            print(f"   📄 Combined books file: all_books.json")
            print(f"   📋 Manifest file: manifest.json")
            print(f"   📊 Statistics file: statistics.json")
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return
    
    print(f"\n✅ JSON export completed successfully!")

def main():
    """Main function."""
    print("Starting JSON export...")
    export_json_data()

if __name__ == "__main__":
    main()