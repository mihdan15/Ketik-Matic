export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeText(text: string): string {
  return text.replace(/[<>]/g, '');
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

export function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
}

export function getRandomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getNextWord(text: string, startIndex: number): { word: string; endIndex: number } {
  const slice = text.slice(startIndex);
  const match = slice.match(/^\S*\s*/);
  const word = match ? match[0] : '';
  return {
    word,
    endIndex: startIndex + word.length
  };
}

export function getRandomChunk(text: string, startIndex: number, minSize: number = 5, maxSize: number = 9): { chunk: string; endIndex: number } {
  const chunkSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
  const chunk = text.slice(startIndex, startIndex + chunkSize);
  
  // Avoid breaking newlines
  if (chunk.includes('\n') && chunk.indexOf('\n') < chunk.length - 1) {
    const newlineIndex = chunk.indexOf('\n') + 1;
    return {
      chunk: chunk.slice(0, newlineIndex),
      endIndex: startIndex + newlineIndex
    };
  }
  
  return {
    chunk,
    endIndex: startIndex + chunk.length
  };
}

