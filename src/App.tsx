import React, { useEffect, useState } from 'react';
import { Plus, LogOut, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useNoteStore } from './store/noteStore';
import { NoteCard } from './components/NoteCard';
import { NoteForm } from './components/NoteForm';
import { SearchBar } from './components/SearchBar';
import { Auth } from './components/Auth';
import { Note } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

function App() {
  const { notes, filteredNotes, loading, error, fetchNotes, addNote, updateNote, deleteNote } = useNoteStore();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [session, setSession] = useState(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Supabase Configuration Required</h1>
          <p className="text-gray-600 mb-4">
            Please set up your Supabase environment variables in the <code>.env</code> file:
          </p>
          <pre className="bg-gray-50 p-4 rounded-md text-sm text-left mb-4 overflow-x-auto">
            <code>
              VITE_SUPABASE_URL=your-project-url{'\n'}
              VITE_SUPABASE_ANON_KEY=your-anon-key
            </code>
          </pre>
          <p className="text-gray-600 text-sm">
            See the README.md file for detailed setup instructions.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchNotes();
    });

    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchNotes();
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => subscription.unsubscribe();
  }, [fetchNotes]);

  const handleAddNote = async (note: Partial<Note>) => {
    try {
      await addNote(note as Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
      setShowForm(false);
      toast.success('Note created successfully!');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (note: Partial<Note>) => {
    if (!editingNote) return;
    try {
      await updateNote(editingNote.id, note);
      setEditingNote(null);
      toast.success('Note updated successfully!');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        toast.success('Note deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleSignOut = async () => {
    await supabase?.auth.signOut();
    toast.success('Signed out successfully');
  };

  if (!session) {
    return <Auth onSuccess={() => fetchNotes()} />;
  }

  const displayedNotes = filteredNotes || notes;

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Notes</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="mr-2" size={16} />
              New Note
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <LogOut className="mr-2" size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <NoteForm
              onSubmit={handleAddNote}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {editingNote && (
          <div className="mb-8 bg-white rounded-lg shadow-md p-6">
            <NoteForm
              note={editingNote}
              onSubmit={handleUpdateNote}
              onCancel={() => setEditingNote(null)}
            />
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;