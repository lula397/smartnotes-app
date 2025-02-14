export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  summary: string | null;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
}

export interface User {
  id: string;
  email: string;
}