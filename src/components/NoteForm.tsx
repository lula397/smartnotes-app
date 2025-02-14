import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, MessageSquare, Tag } from 'lucide-react';
import { Note } from '../types';
import { summarizeText, extractKeyPoints, analyzeSentiment, suggestCategories } from '../lib/ai';
import { categoryColors } from '../lib/colors';
import { toast } from 'react-hot-toast';

interface NoteFormProps {
  note?: Note;
  onSubmit: (note: Partial<Note>) => void;
  onCancel: () => void;
}

const categories = ['Work', 'Personal', 'Ideas', 'Tasks', 'Other'];

export function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState(note?.category || categories[0]);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [loading, setLoading] = useState(false);

  const colors = categoryColors[category as keyof typeof categoryColors];

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
    }
  }, [note]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, content, category, summary });
    setTitle('');
    setContent('');
    setCategory(categories[0]);
    setSummary('');
    setKeyPoints([]);
    setSentiment(null);
    setSuggestedCategories([]);
  };

  const handleEnhanceNote = async () => {
    if (!content.trim()) {
      toast.error('Please add some content first');
      return;
    }
    
    setLoading(true);
    try {
      const [summaryResult, keyPointsResult, sentimentResult, categoriesResult] = await Promise.all([
        summarizeText(content, summaryLength),
        extractKeyPoints(content),
        analyzeSentiment(content),
        suggestCategories(content)
      ]);

      setSummary(summaryResult);
      setKeyPoints(keyPointsResult);
      setSentiment(sentimentResult);
      setSuggestedCategories(categoriesResult);

      toast.success('Note summarised successfully!');
    } catch (error) {
      console.error('Failed to enhance note:', error);
      toast.error('Note summarisation is currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 p-6 rounded-lg ${colors.bg} ${colors.border} border transition-colors`}>
      <div>
        <label htmlFor="title" className={`block text-sm font-medium ${colors.text}`}>
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className={`block text-sm font-medium ${colors.text}`}>
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="content" className={`block text-sm font-medium ${colors.text}`}>
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={`block text-sm font-medium ${colors.text}`}>
            Summary Length
          </label>
          <select
            value={summaryLength}
            onChange={(e) => setSummaryLength(e.target.value as 'short' | 'medium' | 'long')}
            className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>
        
        <button
          type="button"
          onClick={handleEnhanceNote}
          disabled={!content || loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Summarising Note...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Sparkles className="mr-2 h-4 w-4" />
              Summarise Note
            </span>
          )}
        </button>

        {(summary || keyPoints.length > 0 || sentiment || suggestedCategories.length > 0) && (
          <div className={`mt-4 space-y-4 p-4 rounded-md ${colors.bg}`}>
            {summary && (
              <div>
                <h4 className={`text-sm font-medium ${colors.text} mb-1 flex items-center`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Summary
                </h4>
                <p className={`text-sm ${colors.text}`}>{summary}</p>
              </div>
            )}

            {keyPoints.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium ${colors.text} mb-1 flex items-center`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Key Points
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {keyPoints.map((point, index) => (
                    <li key={index} className={`text-sm ${colors.text}`}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {sentiment && (
              <div>
                <h4 className={`text-sm font-medium ${colors.text} mb-1 flex items-center`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Sentiment
                </h4>
                <p className={`text-sm capitalize ${getSentimentColor(sentiment)}`}>
                  {sentiment}
                </p>
              </div>
            )}

            {suggestedCategories.length > 0 && (
              <div>
                <h4 className={`text-sm font-medium ${colors.text} mb-1 flex items-center`}>
                  <Tag className="mr-2 h-4 w-4" />
                  Suggested Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        category === cat
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {note ? 'Update' : 'Create'} Note
        </button>
      </div>
    </form>
  );
}