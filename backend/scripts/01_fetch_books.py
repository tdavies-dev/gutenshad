"""
Fetch books from Project Gutenberg.
This script scrapes the top 100 books from Project Gutenberg, 
finds their IDs using gutendex, and downloads the full text.
"""

import requests
import json
import time
import re
from pathlib import Path
from bs4 import BeautifulSoup

def scrape_top100_books():
    """Scrape the Project Gutenberg top 100 page to get titles and authors."""
    url = "https://www.gutenberg.org/browse/scores/top"
    
    try:
        print("Scraping Project Gutenberg top 100 page...")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        books = []
        
        # Find the "Top 100 EBooks last 30 days" section
        # Look for ordered list items containing book info
        book_links = soup.find_all('a', href=re.compile(r'/ebooks/\d+'))
        
        seen_titles = set()
        
        for link in book_links[:100]:  # Limit to first 100
            title_text = link.get_text(strip=True)
            
            # Skip if we've already seen this title
            if title_text in seen_titles:
                continue
            seen_titles.add(title_text)
            
            # Try to extract author from the link's context
            # Look for author info in nearby text or parent elements
            parent = link.parent
            full_text = parent.get_text() if parent else title_text
            
            # Try to parse "Title by Author" format
            if " by " in full_text:
                parts = full_text.split(" by ")
                if len(parts) >= 2:
                    title = parts[0].strip()
                    author = parts[1].split('(')[0].strip()  # Remove download count in parentheses
                    
                    books.append({
                        "title": title,
                        "author": author
                    })
            else:
                # If no author found, just use the title
                books.append({
                    "title": title_text,
                    "author": "Unknown"
                })
        
        print(f"Scraped {len(books)} books from top 100 page")
        return books
        
    except Exception as e:
        print(f"Error scraping top 100 page: {e}")

def search_gutendex_for_book(title, author):
    """Search gutendex API for a book and return its Project Gutenberg ID and metadata."""
    try:
        # Try searching with title and author
        search_url = "https://gutendex.com/books/"
        params = {
            "search": f"{title} {author}",
            "languages": "en"
        }
        
        print(f"  Searching gutendex with: '{title} {author}'")
        response = requests.get(search_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Found {data.get('count', 0)} total results")
            
            if data.get('results') and len(data['results']) > 0:
                book = data['results'][0]  # Take the first result
                print(f"  Using first result: {book['title']} (ID: {book['id']})")
                return {
                    "id": book['id'],
                    "title": book['title'],
                    "authors": [author['name'] for author in book.get('authors', [])],
                    "formats": book.get('formats', {}),
                    "download_count": book.get('download_count', 0)
                }
        
        # If that didn't work, try searching just the title
        params = {"search": title, "languages": "en"}
        response = requests.get(search_url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            
            if data.get('results') and len(data['results']) > 0:
                book = data['results'][0]
                return {
                    "id": book['id'],
                    "title": book['title'],
                    "authors": [author['name'] for author in book.get('authors', [])],
                    "formats": book.get('formats', {}),
                    "download_count": book.get('download_count', 0)
                }
    
    except requests.RequestException as e:
        print(f"  Error searching gutendex for '{title}' by {author}: {e}")
    
    return None

def download_book_text(book_metadata):
    """Download the plain text version of a book using its formats."""
    formats = book_metadata.get('formats', {})
    
    # Look for plain text formats in order of preference
    text_urls = []
    
    for format_type, url in formats.items():
        if 'text/plain' in format_type or format_type.endswith('.txt'):
            text_urls.append(url)
    
    # Try each URL until we find one that works
    for url in text_urls:
        try:
            print(f"  Downloading from: {url}")
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                return response.text
        except requests.RequestException as e:
            print(f"  Failed to download from {url}: {e}")
            continue
    
    return None

def clean_gutenberg_text(text):
    """Remove Project Gutenberg header and footer."""
    if not text:
        return ""
    
    lines = text.split('\n')
    start_idx = 0
    end_idx = len(lines)
    
    # Find start of actual book content
    for i, line in enumerate(lines):
        if "*** START OF" in line.upper() or "***START OF" in line.upper():
            start_idx = i + 1
            break
    
    # Find end of actual book content
    for i in range(len(lines) - 1, -1, -1):
        if "*** END OF" in lines[i].upper() or "***END OF" in lines[i].upper():
            end_idx = i
            break
    
    # Join the cleaned content
    cleaned_text = '\n'.join(lines[start_idx:end_idx])
    return cleaned_text.strip()

def main():
    """Main function to scrape, search, download, and save books."""
    print("Starting Project Gutenberg book fetching process...")
    
    # Step 1: Scrape the top 100 books page
    top_books = scrape_top100_books()
    
    if not top_books:
        print("No books found. Exiting.")
        return
    
    # Step 2: For each book, find its ID using gutendex and download
    books_data = []
    
    # Process all books (change to [:10] for testing with just 10 books)
    for i, book_info in enumerate(top_books):
        print(f"\nProcessing {i+1}/{len(top_books)}: {book_info['title']} by {book_info['author']}")
        
        # Search for the book using gutendex
        book_metadata = search_gutendex_for_book(book_info['title'], book_info['author'])
        
        if not book_metadata:
            print(f"  Could not find book in gutendex")
            continue
        
        print(f"  Found book with ID: {book_metadata['id']}")
        
        # Download the book text
        book_text = download_book_text(book_metadata)
        
        if not book_text:
            print(f"  Could not download book text")
            continue
        
        # Clean the text
        cleaned_text = clean_gutenberg_text(book_text)
        
        # Create the final book object
        final_book = {
            "id": book_metadata['id'],
            "title": book_metadata['title'],
            "author": ', '.join(book_metadata['authors']) if book_metadata['authors'] else book_info['author'],
            "text": cleaned_text
        }
        
        books_data.append(final_book)
        print(f"  Successfully processed!")
        
        # Be respectful to the servers, add 2 second delay between requests 
        time.sleep(2)
    
    # Step 3: Save all books to JSON file
    output_dir = Path(__file__).parent.parent / "data" / "raw"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / "books.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(books_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nCompleted! Successfully fetched {len(books_data)} books.")
    print(f"Data saved to: {output_file}")

if __name__ == "__main__":
    main()