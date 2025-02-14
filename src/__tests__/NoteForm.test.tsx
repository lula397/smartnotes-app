import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteForm } from '../components/NoteForm';

describe('NoteForm', () => {
  it('renders empty form correctly', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<NoteForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('renders form with existing note data', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const note = {
      id: '1',
      title: 'Test Note',
      content: 'Test Content',
      category: 'Work',
      created_at: '2024-03-10T12:00:00Z',
      updated_at: '2024-03-10T12:00:00Z',
      user_id: 'user123'
    };

    render(<NoteForm note={note} onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Note');
    expect(screen.getByLabelText(/content/i)).toHaveValue('Test Content');
    expect(screen.getByLabelText(/category/i)).toHaveValue('Work');
  });

  it('submits form with entered data', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<NoteForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.type(screen.getByLabelText(/title/i), 'New Note');
    await user.type(screen.getByLabelText(/content/i), 'New Content');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Personal');

    fireEvent.submit(screen.getByRole('button', { name: /create note/i }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Note',
      content: 'New Content',
      category: 'Personal',
      summary: ''
    }));
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<NoteForm onSubmit={onSubmit} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });
});