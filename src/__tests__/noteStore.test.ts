import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNoteStore } from '../store/noteStore';
import { Note } from '../types';
import { supabase } from '../lib/supabase';

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user1' } },
        error: null,
      }),
    },
    from: vi.fn(),
  },
}));

describe('Note Store', () => {
  const mockNote: Note = {
    id: '1',
    title: 'Test Note',
    content: 'Content',
    category: 'Work',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user1',
    summary: null
  };

  beforeEach(() => {
    useNoteStore.setState({
      notes: [],
      filteredNotes: null,
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchNotes', () => {
    it('should fetch notes successfully', async () => {
      // Setup the mock chain
      const orderMock = vi.fn().mockResolvedValue({
        data: [mockNote],
        error: null,
      });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      // Apply the mock chain
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const store = useNoteStore.getState();
      await store.fetchNotes();

      expect(fromMock).toHaveBeenCalledWith('notes');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('user_id', 'user1');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(store.notes).toEqual([mockNote]);
      expect(store.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch notes');
      
      // Setup the mock chain
      const orderMock = vi.fn().mockResolvedValue({
        data: null,
        error,
      });
      const eqMock = vi.fn().mockReturnValue({ order: orderMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      // Apply the mock chain
      vi.mocked(supabase.from).mockImplementation(fromMock);

      const store = useNoteStore.getState();
      await expect(store.fetchNotes()).rejects.toThrow('Failed to fetch notes');

      expect(store.notes).toEqual([]);
      expect(store.error).toBe('Failed to fetch notes');
    });
  });
});