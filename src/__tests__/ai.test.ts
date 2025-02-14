import { describe, it, expect, beforeEach, vi } from 'vitest';
import { summarizeText, processNLQuery } from '../lib/ai';
import { Note } from '../types';

describe('AI Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('summarizeText', () => {
    it('should handle unavailable Ollama service', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection refused'));

      const summary = await summarizeText('Test text', 'short');
      expect(summary).toBe('Test text');
    });

    it('should generate a summary when Ollama is available', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true } as Response) // Ollama check
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: 'This is a test summary.' })
        } as Response);

      const summary = await summarizeText('Long text content', 'short');
      expect(summary).toBe('This is a test summary.');
    });

    it('should use cache for repeated requests', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true } as Response) // Ollama check
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: 'Cached summary' })
        } as Response);

      const text = 'Test text';
      const firstResult = await summarizeText(text, 'medium');
      const secondResult = await summarizeText(text, 'medium');

      expect(firstResult).toBe(secondResult);
      expect(fetch).toHaveBeenCalledTimes(2); // One for check, one for summary
    });
  });

  describe('processNLQuery', () => {
    const mockNotes: Note[] = [
      {
        id: '1',
        title: 'Meeting Notes',
        content: 'Discussed project timeline',
        category: 'Work',
        created_at: '2024-03-10T10:00:00Z',
        updated_at: '2024-03-10T10:00:00Z',
        user_id: 'user1',
        summary: null
      },
      {
        id: '2',
        title: 'Shopping List',
        content: 'Buy groceries',
        category: 'Personal',
        created_at: '2024-03-11T15:00:00Z',
        updated_at: '2024-03-11T15:00:00Z',
        user_id: 'user1',
        summary: null
      }
    ];

    it('should handle date-based queries without Ollama', async () => {
      const results = await processNLQuery('notes from yesterday', mockNotes);
      expect(results).toBeInstanceOf(Array);
    });

    it('should fallback to text search when Ollama is unavailable', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Connection refused'));

      const results = await processNLQuery('meeting project', mockNotes);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Meeting Notes');
    });

    it('should perform semantic search when Ollama is available', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({ ok: true } as Response) // Ollama check
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: [0.1, 0.2, 0.3] })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ response: [0.2, 0.3, 0.4] })
        } as Response);

      const results = await processNLQuery('project meeting', mockNotes);
      expect(results).toBeInstanceOf(Array);
    });
  });
});