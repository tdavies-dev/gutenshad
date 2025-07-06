// basic gutenberg text fetcher with caching
import { promises as fs } from 'fs';

interface BookInfo {
  id: number;
  title: string;
  author: string;
}

interface Chapter {
  title: string;
  content: string;
}

interface LoadedBook extends BookInfo {
  chapters: Chapter[];
  totalChapters: number;
}

const BOOKS: Record<string, BookInfo> = {
  'pride_prejudice': { id: 1342, title: 'Pride and Prejudice', author: 'Jane Austen' },
  'alice_wonderland': { id: 11, title: 'Alice in Wonderland', author: 'Lewis Carroll' },
  'frankenstein': { id: 84, title: 'Frankenstein', author: 'Mary Shelley' },
  'dracula': { id: 345, title: 'Dracula', author: 'Bram Stoker' },
  'great_gatsby': { id: 64317, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' }
};

async function fetchGutenbergText(bookId: number): Promise<string | null> {
  const url = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`failed to fetch book ${bookId}: ${response.status}`);
    }
    
    const text = await response.text();
    return cleanGutenbergText(text);
  } catch (error) {
    console.error(`error fetching ${bookId}:`, error);
    return null;
  }
}

function cleanGutenbergText(rawText: string): string {
  // remove gutenberg header/footer junk
  const lines = rawText.split('\n');
  
  // find start of actual content (after the header)
  let startIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('*** START OF') || 
        lines[i].includes('***START OF') ||
        lines[i].match(/^CHAPTER|^Chapter|^I\.|^1\./)) {
      startIdx = i;
      break;
    }
  }
  
  // find end of content (before footer)
  let endIdx = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('*** END OF') || 
        lines[i].includes('***END OF')) {
      endIdx = i;
      break;
    }
  }
  
  // clean up the content
  const content = lines.slice(startIdx, endIdx)
    .join('\n')
    .replace(/\r\n/g, '\n')  // normalize line endings
    .replace(/\n{3,}/g, '\n\n')  // collapse excessive newlines
    .trim();
    
  return content;
}

function splitIntoChapters(text: string): Chapter[] {
  // this is naive but works for most books
  const chapterRegex = /^(CHAPTER|Chapter|BOOK|Book)\s+[IVXLCDM\d]+|^[IVXLCDM]+\.|^\d+\./gm;
  
  const chapters: Chapter[] = [];
  let matches = [...text.matchAll(chapterRegex)];
  
  if (matches.length === 0) {
    // no chapter markers found, treat whole text as one chapter
    return [{ title: 'Full Text', content: text }];
  }
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];
    
    const start = match.index!;
    const end = nextMatch ? nextMatch.index! : text.length;
    
    const chapterContent = text.slice(start, end).trim();
    const title = match[0].trim();
    
    chapters.push({
      title,
      content: chapterContent
    });
  }
  
  return chapters;
}

async function loadBook(bookKey: string): Promise<LoadedBook> {
  const book = BOOKS[bookKey];
  if (!book) {
    throw new Error(`unknown book: ${bookKey}`);
  }
  
  console.log(`fetching ${book.title} by ${book.author}...`);
  
  const text = await fetchGutenbergText(book.id);
  if (!text) {
    throw new Error(`failed to fetch ${book.title}`);
  }
  
  const chapters = splitIntoChapters(text);
  
  return {
    ...book,
    chapters,
    totalChapters: chapters.length
  };
}

// caching functions
async function ensureBooksDir() {
  try {
    await fs.mkdir('./books', { recursive: true });
    console.log('books directory created/verified');
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      console.error('failed to create books directory:', error);
      throw error;
    }
  }
}

async function cacheBookToFile(bookKey: string, book: LoadedBook) {
  await ensureBooksDir();
  const filePath = `./books/${bookKey}.json`;
  await fs.writeFile(filePath, JSON.stringify(book, null, 2));
  console.log(`cached ${book.title} to ${filePath}`);
}

async function loadBookFromCache(bookKey: string): Promise<LoadedBook | null> {
  try {
    const filePath = `./books/${bookKey}.json`;
    const data = await fs.readFile(filePath, 'utf8');
    console.log(`loaded ${bookKey} from cache`);
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// clean demo function that caches all books
async function demo() {
  try {
    console.log('starting book caching process...');
    
    for (const key in BOOKS) {
      console.log(`\nprocessing ${key}...`);
      
      const cachedBook = await loadBookFromCache(key);
      if (cachedBook) {
        console.log(`loaded ${cachedBook.title} from cache.`);
      } else {
        console.log(`not in cache, fetching ${BOOKS[key].title}...`);
        const book = await loadBook(key);
        await cacheBookToFile(key, book);
        console.log(`cached ${book.title} to file.`);
      }
    }
    
    console.log('\nall books processed successfully!');
  } catch (error) {
    console.error('demo failed:', error);
  }
}

// uncomment to run:
demo();

export { BOOKS, loadBookFromCache, type BookInfo, type Chapter, type LoadedBook };
