export function vocabularyId(chapter: string, item: { id: number; word: string[] }) {
  return `vocabulary:${JSON.stringify([chapter, item.id, item.word[0]])}`
}
export function listeningId(word: string) { return `listening:${word}` }
export function readingId(category: string, word: any[]) { return `reading:${JSON.stringify([category, word[0], word[1]])}` }
export function corpusId(chapter: string, word: string) { return `corpus:${JSON.stringify([chapter, word])}` }

