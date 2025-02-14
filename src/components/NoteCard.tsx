import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { Note } from '../types';
import { categoryColors } from '../lib/colors';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const colors = categoryColors[note.category as keyof typeof categoryColors];

  return (
    <div className={`rounded-lg shadow-md p-6 transition-shadow ${colors.bg} ${colors.border} border ${colors.hover}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`text-xl font-semibold ${colors.text}`}>{note.title}</h3>
          <span className={`inline-block px-2 py-1 text-sm font-medium rounded-full mt-2 ${colors.badge}`}>
            {note.category}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className={`p-2 transition-colors ${colors.text} hover:opacity-75`}
            aria-label="Edit note"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className={`p-2 transition-colors ${colors.text} hover:opacity-75`}
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className={`mb-4 whitespace-pre-wrap ${colors.text}`}>{note.content}</p>
      <div className={`text-sm ${colors.text} opacity-75`}>
        Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
      </div>
    </div>
  );
}