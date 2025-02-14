import { LRUCache } from 'lru-cache';
import * as chrono from 'chrono-node';
import { Note } from '../types';

// Cache configuration
const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 60 * 24, // 24 hour TTL
});

// Check if Ollama is available
const isOllamaAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: 'test',
        stream: false
      })
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Generate text using Ollama with fallback
async function generateText(prompt: string, fallback: () => string): Promise<string> {
  const ollama = await isOllamaAvailable();
  if (!ollama) {
    console.log('Ollama not available, using fallback');
    return fallback();
  }

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          max_tokens: 150
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate text');
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    console.log('Ollama request failed, using fallback');
    return fallback();
  }
}

// Text summarization
export async function summarizeText(
  text: string,
  length: 'short' | 'medium' | 'long' = 'medium'
): Promise<string> {
  if (!text.trim()) {
    return '';
  }

  const cacheKey = `summary-${text}-${length}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const lengthPrompt = {
    short: 'Summarize this in 1-2 sentences:',
    medium: 'Summarize this in 2-3 sentences:',
    long: 'Summarize this in 3-4 sentences:'
  }[length];

  const summary = await generateText(
    `${lengthPrompt}\n\n${text}`,
    () => {
      const words = text.split(/\s+/);
      const summaryLength = {
        short: Math.min(10, words.length),
        medium: Math.min(20, words.length),
        long: Math.min(30, words.length)
      }[length];
      return words.slice(0, summaryLength).join(' ') + 
        (words.length > summaryLength ? '...' : '');
    }
  );

  cache.set(cacheKey, summary);
  return summary;
}

// Extract key points
export async function extractKeyPoints(text: string): Promise<string[]> {
  if (!text.trim()) {
    return [];
  }

  const cacheKey = `keypoints-${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const points = await generateText(
    `Extract 3-5 key points from this text, format as a bullet list:\n\n${text}`,
    () => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      return sentences.slice(0, 3).map(s => s.trim()).join('\n');
    }
  );

  const keyPoints = points
    .split('\n')
    .map(point => point.replace(/^[•\-\*]\s*/, '').trim())
    .filter(point => point.length > 0);

  cache.set(cacheKey, keyPoints);
  return keyPoints;
}

// Analyze sentiment
export async function analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'> {
  if (!text.trim()) {
    return 'neutral';
  }

  const cacheKey = `sentiment-${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const sentiment = await generateText(
    `Analyze the sentiment of this text. Reply with only one word (positive, neutral, or negative):\n\n${text}`,
    () => {
      // Simple fallback sentiment analysis
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'happy'];
      const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'sad', 'angry'];
      
      const words = text.toLowerCase().split(/\s+/);
      const positiveCount = words.filter(w => positiveWords.includes(w)).length;
      const negativeCount = words.filter(w => negativeWords.includes(w)).length;
      
      if (positiveCount > negativeCount) return 'positive';
      if (negativeCount > positiveCount) return 'negative';
      return 'neutral';
    }
  );

  const normalizedSentiment = sentiment.toLowerCase().trim() as 'positive' | 'neutral' | 'negative';
  cache.set(cacheKey, normalizedSentiment);
  return normalizedSentiment;
}

// Suggest categories
export async function suggestCategories(text: string): Promise<string[]> {
  if (!text.trim()) {
    return ['Other'];
  }

  const cacheKey = `categories-${text}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const suggestions = await generateText(
    `Suggest 2-3 relevant categories for this text from the following options: Work, Personal, Ideas, Tasks, Other. Format as a comma-separated list:\n\n${text}`,
    () => {
      // Simple fallback categorization
      const categories = [];
      
      const workKeywords = ['meeting', 'project', 'deadline', 'client', 'report'];
      const personalKeywords = ['family', 'home', 'health', 'hobby', 'friend'];
      const ideasKeywords = ['idea', 'concept', 'innovation', 'creative', 'solution'];
      const tasksKeywords = ['todo', 'task', 'action', 'complete', 'finish'];
      
      const lowerText = text.toLowerCase();
      
      if (workKeywords.some(w => lowerText.includes(w))) categories.push('Work');
      if (personalKeywords.some(w => lowerText.includes(w))) categories.push('Personal');
      if (ideasKeywords.some(w => lowerText.includes(w))) categories.push('Ideas');
      if (tasksKeywords.some(w => lowerText.includes(w))) categories.push('Tasks');
      
      return categories.length > 0 ? categories.join(', ') : 'Other';
    }
  );

  const categories = suggestions
    .split(',')
    .map(cat => cat.trim())
    .filter(cat => ['Work', 'Personal', 'Ideas', 'Tasks', 'Other'].includes(cat));

  cache.set(cacheKey, categories);
  return categories;
}

// Natural Language Query processing
export async function processNLQuery(
  query: string,
  notes: Note[]
): Promise<Note[]> {
  if (!query.trim() || !notes.length) {
    return notes;
  }

  const cacheKey = `query-${query}-${notes.length}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Parse date-related queries (this works without Ollama)
  const dateInfo = chrono.parse(query);
  if (dateInfo.length > 0) {
    const date = dateInfo[0].start.date();
    const filteredNotes = notes.filter(note => {
      const noteDate = new Date(note.created_at);
      return noteDate >= date;
    });
    cache.set(cacheKey, filteredNotes);
    return filteredNotes;
  }

  const ollama = await isOllamaAvailable();
  if (!ollama) {
    // Fallback to simple text search
    const searchTerms = query.toLowerCase().split(' ');
    const results = notes.filter(note => {
      const content = `${note.title} ${note.content} ${note.category}`.toLowerCase();
      return searchTerms.every(term => content.includes(term));
    });
    cache.set(cacheKey, results);
    return results;
  }

  try {
    // Semantic search using Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: query,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const queryEmbedding = await response.json();

    // Get embeddings for all notes
    const noteEmbeddings = await Promise.all(
      notes.map(async (note) => {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'nomic-embed-text',
            prompt: `${note.title} ${note.content}`,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate note embedding');
        }

        const embedding = await response.json();
        return { note, embedding };
      })
    );

    // Calculate cosine similarity and rank results
    const results = noteEmbeddings
      .map(({ note, embedding }) => ({
        note,
        similarity: cosineSimilarity(queryEmbedding.response, embedding.response)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .map(result => result.note);

    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.log('Semantic search failed, using text search fallback');
    // Fallback to simple text search
    const searchTerms = query.toLowerCase().split(' ');
    const results = notes.filter(note => {
      const content = `${note.title} ${note.content} ${note.category}`.toLowerCase();
      return searchTerms.every(term => content.includes(term));
    });
    cache.set(cacheKey, results);
    return results;
  }
}

// Utility function to calculate cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((acc, val, i) => acc + val * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((acc, val) => acc + val * val, 0));
  const mag2 = Math.sqrt(vec2.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (mag1 * mag2);
}