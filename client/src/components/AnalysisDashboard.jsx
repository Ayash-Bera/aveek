import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessionResults } from '../api/index.js';
import StatsRow from './StatsRow.jsx';
import SentimentChart from './SentimentChart.jsx';
import WordCloudView from './WordCloudView.jsx';
import SummaryPanel from './SummaryPanel.jsx';
import FilterBar from './FilterBar.jsx';
import CommentList from './CommentList.jsx';
import ExportButton from './ExportButton.jsx';

export default function AnalysisDashboard({ sessionId, onReset }) {
  const [filters, setFilters] = useState({ sentiment: '', keyword: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['session-results', sessionId],
    queryFn: () => getSessionResults(sessionId),
    staleTime: 60_000,
  });

  if (isLoading) return <div className="text-center py-16 text-gray-500">Loading results...</div>;
  if (error) return <div className="text-center py-16 text-red-500">Failed to load results.</div>;

  const { session, sentimentCounts, keywords, aggregateSummary } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-gray-500 text-sm mt-1">{session.filename} — {session.total_comments} comments</p>
        </div>
        <div className="flex gap-3">
          <ExportButton sessionId={sessionId} />
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      <StatsRow sentimentCounts={sentimentCounts} total={session.total_comments} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart sentimentCounts={sentimentCounts} />
        <WordCloudView
          keywords={keywords}
          onWordClick={(word) => setFilters((f) => ({ ...f, keyword: word }))}
        />
      </div>

      <SummaryPanel summary={aggregateSummary} />

      <FilterBar filters={filters} onChange={setFilters} />
      <CommentList sessionId={sessionId} filters={filters} />
    </div>
  );
}
