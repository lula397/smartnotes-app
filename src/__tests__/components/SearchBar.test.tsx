import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../components/SearchBar';
import { processNLQuery } from '../../lib/ai';
import { useNoteStore } from '../../store/noteStore';

// Mock dependencies
vi.mock('../../lib/ai', () => ({
  processNLQuery: vi.fn()
}));

vi.mock('../../store/noteStore', () => ({
  useNoteStore: vi.fn()
}));

describe('SearchBar', () => {
  const mockSetFilteredNotes = vi.fn();
  const mockNotes = [
    {
      id: '1',
      title: 'Test Note',
      content: 'Test Content',
      category: 'Work',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user1'
    }
  ];

  beforeEach(() => {
    vi.mocked(useNoteStore).mockReturnValue({
      notes: mockNotes,
      setFilteredNotes: mockSetFilteredNotes
    } as any);
  });

  it('renders search input correctly', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
  });

  it('handles empty search query', async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await user.type(searchInput, '   ');
    fireEvent.submit(searchInput);

    expect(mockSetFilteredNotes).toHaveBeenCalledWith(null);
    expect(processNLQuery).not.toHaveBeenCalled();
  });

  it('processes natural language query successfully', async () => {
    vi.mocked(processNLQuery).mockResolvedValueOnce(mockNotes);
    
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await user.type(searchInput, 'notes from last week');
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(processNLQuery).toHaveBeenCalledWith('notes from last week', mockNotes);
      expect(mockSetFilteredNotes).toHaveBeenCalledWith(mockNotes);
    });
  });

  it('handles search errors gracefully', async () => {
    vi.mocked(processNLQuery).mockRejectedValueOnce(new Error('Search failed'));
    
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await user.type(searchInput, 'invalid query');
    fireEvent.submit(searchInput);

    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      expect(mockSetFilteredNotes).toHaveBeenCalledWith(null);
    });
  });

  it('shows loading state during search', async () => {
    vi.mocked(processNLQuery).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const user = userEvent.setup();
    render(<SearchBar />);

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await user.type(searchInput, 'test query');
    fireEvent.submit(searchInput);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});