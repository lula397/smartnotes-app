import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { processNLQuery } from '../lib/ai';

export function SearchBar() {
  const { notes, setFilteredNotes } = useNoteStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setFilteredNotes(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await processNLQuery(query, notes);
      setFilteredNotes(results);
    } catch (error) {
      setError((error as Error).message);
      setFilteredNotes(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        {loading ? (
          <div role="status" aria-label="Loading..." className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="text-gray-400 animate-spin" size={20} />
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes (e.g., 'Show notes from last week' or 'Find meeting notes')"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && (
        <div className="absolute w-full mt-1 p-2 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}
    </form>
  );
}