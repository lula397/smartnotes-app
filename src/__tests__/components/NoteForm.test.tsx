import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteForm } from '../../components/NoteForm';

// Mock AI functions
vi.mock('../../lib/ai', () => ({
  summarizeText: vi.fn().mockResolvedValue('Generated summary'),
  extractKeyPoints: vi.fn().mockResolvedValue(['Point 1', 'Point 2']),
  analyzeSentiment: vi.fn().mockResolvedValue('positive'),
  suggestCategories: vi.fn().mockResolvedValue(['Work', 'Tasks'])
}));

describe('NoteForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty form correctly', () => {
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /summarise note/i })).toBeInTheDocument();
  });

  it('renders form with existing note data', () => {
    const note = {
      id: '1',
      title: 'Test Note',
      content: 'Test Content',
      category: 'Work',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user1',
      summary: null
    };

    render(<NoteForm note={note} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Note');
    expect(screen.getByLabelText(/content/i)).toHaveValue('Test Content');
    expect(screen.getByLabelText(/category/i)).toHaveValue('Work');
  });

  it('handles form submission with valid data', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/title/i), 'New Note');
    await user.type(screen.getByLabelText(/content/i), 'New Content');
    await user.selectOptions(screen.getByLabelText(/category/i), 'Personal');

    fireEvent.submit(screen.getByRole('button', { name: /create note/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'New Content',
      category: 'Personal',
      summary: ''
    });
  });

  it('generates summary when requested', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/content/i), 'Test content for summary');
    await user.click(screen.getByRole('button', { name: /summarise note/i }));

    await waitFor(() => {
      expect(screen.getByText('Generated summary')).toBeInTheDocument();
    });
  });

  it('handles summary generation error', async () => {
    vi.mocked(summarizeText).mockRejectedValueOnce(new Error('Summary failed'));
    
    const user = userEvent.setup();
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.type(screen.getByLabelText(/content/i), 'Test content');
    await user.click(screen.getByRole('button', { name: /summarise note/i }));

    await waitFor(() => {
      expect(screen.queryByText('Generated summary')).not.toBeInTheDocument();
    });
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    render(<NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});