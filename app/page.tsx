'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasteUrl('');
    setLoading(true);

    try {
      const body: any = { content };
      
      if (ttl) {
        const ttlNum = parseInt(ttl, 10);
        if (isNaN(ttlNum) || ttlNum < 1) {
          setError('TTL must be a positive integer');
          setLoading(false);
          return;
        }
        body.ttl_seconds = ttlNum;
      }
      
      if (maxViews) {
        const maxViewsNum = parseInt(maxViews, 10);
        if (isNaN(maxViewsNum) || maxViewsNum < 1) {
          setError('Max views must be a positive integer');
          setLoading(false);
          return;
        }
        body.max_views = maxViewsNum;
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        setLoading(false);
        return;
      }

      setPasteUrl(data.url);
      setContent('');
      setTtl('');
      setMaxViews('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Pastebin Lite</h1>
          <p className="text-gray-600">Share text snippets with optional expiry and view limits</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Paste Content *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                placeholder="Enter your text here..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ttl" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry (seconds)
                </label>
                <input
                  id="ttl"
                  type="number"
                  min="1"
                  value={ttl}
                  onChange={(e) => setTtl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label htmlFor="maxViews" className="block text-sm font-medium text-gray-700 mb-2">
                  Max Views
                </label>
                <input
                  id="maxViews"
                  type="number"
                  min="1"
                  value={maxViews}
                  onChange={(e) => setMaxViews(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {pasteUrl && (
              <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-md">
                <p className="text-green-800 font-medium mb-2">Paste created successfully!</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pasteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-md text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(pasteUrl);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                  <a
                    href={pasteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Paste'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Pastes are stored securely and will expire based on your settings.</p>
        </div>
      </div>
    </div>
  );
}
