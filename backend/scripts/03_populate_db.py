#!/usr/bin/env python3
"""
Populate SQLite database with processed book data.
This script creates the database schema and inserts book data.
"""

import sqlite3
import json
from pathlib import Path

def create_database_schema(cursor):
    """Create the database tables."""
    print("Creating database schema...")
    
    # Books table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            chapter_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Chapters table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            chapter_number INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            word_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (book_id) REFERENCES books (id),
            UNIQUE(book_id, chapter_number)
        )
    ''')
    
    # Create indexes for better performance
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_chapters_book_id 
        ON chapters (book_id)
    ''')
    
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_books_title 
        ON books (title)
    ''')
    
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_books_author 
        ON books (author)
    ''')
    
    print("✅ Database schema created successfully")

def count_words(text):
    """Count words in text."""
    if not text:
        return 0
    return len(text.split())

def insert_book_data(cursor, books_data):
    """Insert book and chapter data into the database."""
    print(f"Inserting {len(books_data)} books into database...")
    
    books_inserted = 0
    chapters_inserted = 0
    
    for i, book in enumerate(books_data):
        book_id = book.get('id')
        title = book.get('title', 'Unknown Title')
        author = book.get('author', 'Unknown Author')
        chapters = book.get('chapters', [])
        
        print(f"  Inserting {i+1}/{len(books_data)}: {title}")
        
        try:
            # Insert book
            cursor.execute('''
                INSERT OR REPLACE INTO books (id, title, author, chapter_count)
                VALUES (?, ?, ?, ?)
            ''', (book_id, title, author, len(chapters)))
            
            books_inserted += 1
            
            # Clear existing chapters for this book (in case of re-run)
            cursor.execute('DELETE FROM chapters WHERE book_id = ?', (book_id,))
            
            # Insert chapters
            for chapter_num, chapter in enumerate(chapters, 1):
                chapter_title = chapter.get('title', f'Chapter {chapter_num}')
                chapter_content = chapter.get('content', '')
                word_count = count_words(chapter_content)
                
                cursor.execute('''
                    INSERT INTO chapters (book_id, chapter_number, title, content, word_count)
                    VALUES (?, ?, ?, ?, ?)
                ''', (book_id, chapter_num, chapter_title, chapter_content, word_count))
                
                chapters_inserted += 1
            
        except sqlite3.Error as e:
            print(f"    ❌ Error inserting book '{title}': {e}")
            continue
    
    print(f"✅ Successfully inserted {books_inserted} books and {chapters_inserted} chapters")
    return books_inserted, chapters_inserted

def create_database_views(cursor):
    """Create useful database views."""
    print("Creating database views...")
    
    # View for book statistics
    cursor.execute('''
        CREATE VIEW IF NOT EXISTS book_stats AS
        SELECT 
            b.id,
            b.title,
            b.author,
            b.chapter_count,
            COALESCE(SUM(c.word_count), 0) as total_words,
            COALESCE(AVG(c.word_count), 0) as avg_words_per_chapter
        FROM books b
        LEFT JOIN chapters c ON b.id = c.book_id
        GROUP BY b.id, b.title, b.author, b.chapter_count
    ''')
    
    # View for chapter details with book info
    cursor.execute('''
        CREATE VIEW IF NOT EXISTS chapter_details AS
        SELECT 
            c.id as chapter_id,
            c.chapter_number,
            c.title as chapter_title,
            c.word_count,
            b.id as book_id,
            b.title as book_title,
            b.author as book_author
        FROM chapters c
        JOIN books b ON c.book_id = b.id
        ORDER BY b.title, c.chapter_number
    ''')
    
    print("✅ Database views created successfully")

def populate_database():
    """Main database population function."""
    # Paths
    input_file = Path(__file__).parent.parent / "data" / "export" / "books_processed.json"
    db_file = Path(__file__).parent.parent / "data" / "books.db"
    
    # Check if input file exists
    if not input_file.exists():
        print(f"❌ Error: Input file {input_file} not found!")
        print("Please run 02_process_books.py first to create the processed books data.")
        return
    
    # Create data directory if it doesn't exist
    db_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Load the processed books data
    print(f"Loading processed books from {input_file}...")
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            books_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Error reading JSON file: {e}")
        return
    except Exception as e:
        print(f"❌ Error loading books data: {e}")
        return
    
    print(f"Loaded {len(books_data)} books from processed data")
    
    # Connect to SQLite database
    print(f"Connecting to database: {db_file}")
    try:
        with sqlite3.connect(db_file) as conn:
            cursor = conn.cursor()
            
            # Create schema
            create_database_schema(cursor)
            
            # Insert data
            books_count, chapters_count = insert_book_data(cursor, books_data)
            
            # Create views
            create_database_views(cursor)
            
            # Commit changes
            conn.commit()
            
            # Print summary statistics
            cursor.execute('SELECT COUNT(*) FROM books')
            total_books = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM chapters')
            total_chapters = cursor.fetchone()[0]
            
            cursor.execute('SELECT SUM(word_count) FROM chapters')
            total_words = cursor.fetchone()[0] or 0
            
            print(f"\n📊 Database Statistics:")
            print(f"   📚 Total books: {total_books}")
            print(f"   📄 Total chapters: {total_chapters}")
            print(f"   📝 Total words: {total_words:,}")
            print(f"   💾 Database file: {db_file}")
            
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return
    
    print(f"\n✅ Database population completed successfully!")

def main():
    """Main function."""
    print("Starting database population...")
    populate_database()

if __name__ == "__main__":
    main()