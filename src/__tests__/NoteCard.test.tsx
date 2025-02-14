import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '../components/NoteCard';

const mockNote = {
  id: '1',
  title: 'Test Note',
  content: 'Test Content',
  category: 'Work',
  created_at: '2024-03-10T12:00:00Z',
  updated_at: '2024-03-10T12:00:00Z',
  user_id: 'user123'
};

describe('NoteCard', () => {
  it('renders note details correctly', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<NoteCard note={mockNote} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<NoteCard note={mockNote} onEdit={onEdit} onDelete={onDelete} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockImplementation(() => true);

    render(<NoteCard note={mockNote} onEdit={onEdit} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockNote.id);
    
    // Restore the original window.confirm
    confirmSpy.mockRestore();
  });
});