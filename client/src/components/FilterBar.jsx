import { useState, useEffect } from 'react';

export default function FilterBar({ filters, onChange }) {
  const [localKeyword, setLocalKeyword] = useState(filters.keyword);

  // Sync when parent resets keyword (e.g. word cloud click updates keyword from outside)
  useEffect(() => {
    setLocalKeyword(filters.keyword);
  }, [filters.keyword]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange((prev) => ({ ...prev, keyword: localKeyword }));
    }, 400);
    return () => clearTimeout(timer);
  }, [localKeyword, onChange]);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={filters.sentiment}
        onChange={(e) => onChange((prev) => ({ ...prev, sentiment: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All sentiments</option>
        <option value="positive">Positive</option>
        <option value="negative">Negative</option>
        <option value="neutral">Neutral</option>
      </select>

      <input
        type="text"
        value={localKeyword}
        onChange={(e) => setLocalKeyword(e.target.value)}
        placeholder="Search comments..."
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {(filters.sentiment || filters.keyword) && (
        <button
          onClick={() => { onChange({ sentiment: '', keyword: '' }); setLocalKeyword(''); }}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
