import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.fetch
global.fetch = vi.fn();

// Mock console.error to avoid noisy test output
console.error = vi.fn();

// Mock environment variables for Supabase
vi.stubEnv('VITE_SUPABASE_URL', 'https://test-project.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// Create a base mock for Supabase client
const createBaseMockClient = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null
    }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        error: null
      })
    })
  })
});

// Setup default mocks for external services
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => createBaseMockClient())
}));