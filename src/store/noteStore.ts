import { create } from 'zustand';
import { Note } from '../types';
import { supabase } from '../lib/supabase';

interface NoteStore {
  notes: Note[];
  filteredNotes: Note[] | null;
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setFilteredNotes: (notes: Note[] | null) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  filteredNotes: null,
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ notes: data || [], loading: false, error: null });
    } catch (error) {
      console.error('Error fetching notes:', error);
      set({ error: (error as Error).message, loading: false, notes: [] });
      throw error;
    }
  },

  addNote: async (note) => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...note, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create note');

      const currentNotes = get().notes;
      set({ 
        notes: [data, ...currentNotes],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error adding note:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateNote: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const noteExists = get().notes.some(note => note.id === id);
      if (!noteExists) throw new Error('Note not found');

      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Note not found');

      const currentNotes = get().notes;
      set({
        notes: currentNotes.map((n) => (n.id === id ? { ...n, ...data } : n)),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error updating note:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  deleteNote: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const currentNotes = get().notes;
      set({
        notes: currentNotes.filter((n) => n.id !== id),
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setFilteredNotes: (notes) => {
    set({ filteredNotes: notes });
  },
}));