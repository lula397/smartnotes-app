# Smart Notes Organizer

A modern web application for organizing and managing notes with powerful AI features and a clean user interface.

## Screenshots
![Screenshot 2025-02-14 at 17 38 44](https://github.com/user-attachments/assets/21c73890-8488-44a1-85ae-1670893718d5)
![Screenshot 2025-02-13 at 17 22 54](https://github.com/user-attachments/assets/d858b580-4dbd-4570-97ba-9cc4fd78d872)
![Screenshot 2025-02-13 at 17 23 37](https://github.com/user-attachments/assets/b35f88ef-6b45-4f60-8ea2-445ce71ee1d3)
![Screenshot 2025-02-14 at 17 35 26](https://github.com/user-attachments/assets/ed192990-3c93-4ec6-a0f5-850b36df289d)

## Features

- Create, edit, and delete notes with rich text content
- Categorize notes (Work, Personal, Ideas, Tasks, Other)
- AI-powered features:
  - Text summarization with adjustable length (short/medium/long)
  - Natural language search queries
  - Semantic search capabilities
  - Date-based intelligent filtering
- Real-time search functionality
- Responsive design
- User authentication and authorization
- Secure data storage with Row Level Security
- Color-coded categories for better visual organization

## Live Demo

The application is deployed and accessible at:
https://musical-macaron-583fc6.netlify.app

## Technologies Used

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Zustand for state management
- React Hot Toast for notifications
- Lucide React for icons
- Date-fns for date formatting

### Backend & Database
- Supabase for database and authentication
- PostgreSQL with Row Level Security
- Real-time subscriptions

### AI Features
- Local Ollama models for text processing
- LLaMA2 for text summarization
- Nomic Embed for semantic search
- Chrono-node for natural language date parsing
- LRU caching for performance optimization

### Testing
- Vitest for test runner
- React Testing Library for component testing
- Jest DOM for DOM assertions
- Mock Service Worker for API mocking

## Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/smart-notes-organizer.git
   cd smart-notes-organizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase:
   - Create a new project at [Supabase](https://supabase.com)
   - Go to Project Settings > API
   - Copy your project URL and anon key
   - Create a `.env` file in the project root:
     ```
     VITE_SUPABASE_URL=your-project-url
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Run the SQL migrations:
     ```sql
     -- Create notes table
     CREATE TABLE IF NOT EXISTS notes (
       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
       title text NOT NULL,
       content text NOT NULL,
       category text NOT NULL,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now(),
       user_id uuid REFERENCES auth.users(id) NOT NULL,
       summary text
     );

     -- Enable RLS
     ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

     -- Create RLS policies
     CREATE POLICY "Users can read own notes"
       ON notes FOR SELECT
       TO authenticated
       USING (auth.uid() = user_id);

     CREATE POLICY "Users can create notes"
       ON notes FOR INSERT
       TO authenticated
       WITH CHECK (auth.uid() = user_id);

     CREATE POLICY "Users can update own notes"
       ON notes FOR UPDATE
       TO authenticated
       USING (auth.uid() = user_id)
       WITH CHECK (auth.uid() = user_id);

     CREATE POLICY "Users can delete own notes"
       ON notes FOR DELETE
       TO authenticated
       USING (auth.uid() = user_id);

     -- Create updated_at trigger
     CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = now();
       RETURN NEW;
     END;
     $$ language 'plpgsql';

     CREATE TRIGGER update_notes_updated_at
       BEFORE UPDATE
       ON notes
       FOR EACH ROW
       EXECUTE PROCEDURE update_updated_at_column();
     ```

4. Set up Ollama (required for AI features):
   - Install Ollama following the instructions at https://ollama.ai
   - Pull required models:
     ```bash
     ollama pull llama2
     ollama pull nomic-embed-text
     ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Run tests:
   ```bash
   npm test
   ```

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── Auth.tsx        # Authentication component
│   │   ├── NoteCard.tsx    # Note display component
│   │   ├── NoteForm.tsx    # Note creation/editing form
│   │   └── SearchBar.tsx   # Search interface
│   ├── lib/                # Utility functions and configurations
│   │   ├── ai.ts          # AI-related functions
│   │   └── supabase.ts    # Supabase client configuration
│   ├── store/             # State management
│   │   └── noteStore.ts   # Zustand store for notes
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Test files
└── README.md
```

## Testing

The project includes comprehensive test coverage:

### Component Tests
- User interface interactions
- Form submissions
- Data display
- Error states
- Loading indicators

### AI Feature Tests
- Text summarization
- Natural language queries
- Semantic search
- Caching behavior
- Error handling

### Store Tests
- State management
- CRUD operations
- Data persistence
- Error handling

### Integration Tests
- Authentication flow
- Note operations
- Search functionality
- AI feature integration

Run tests with coverage report:
```bash
npm test -- --coverage
```

## Security

- Row Level Security (RLS) policies ensure users can only access their own data
- Secure authentication handled by Supabase
- All database operations are protected by RLS policies
- Input validation and sanitization
- Proper error handling and user feedback

## AI Features Implementation

### Text Summarization
- Uses LLaMA2 model for generating concise summaries
- Adjustable summary length (short/medium/long)
- Caches results for improved performance
- Handles text chunks up to 1024 tokens

### Natural Language Search
- Semantic search using Nomic Embed model
- Supports queries like "Show notes from last week"
- Date parsing with chrono-node
- Results ranked by relevance
- Caches search results for better performance

## Performance Optimization

- LRU caching for AI operations
- Efficient state management with Zustand
- Lazy loading of components
- Optimized database queries
- Proper error boundaries and fallbacks

## Color Coding System

Notes are visually categorized using a consistent color scheme:

- Work: Blue theme
- Personal: Purple theme
- Ideas: Green theme
- Tasks: Amber theme
- Other: Gray theme

Each category maintains:
- Subtle background color
- Matching border
- High contrast black text for readability
- Category badge with matching theme
- Hover state for interactivity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.