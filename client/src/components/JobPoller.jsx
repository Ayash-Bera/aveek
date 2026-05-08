import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessionResults } from '../api/index.js';

export default function JobPoller({ sessionId, totalComments, onComplete }) {
  const { data, error } = useQuery({
    queryKey: ['session-status', sessionId],
    queryFn: () => getSessionResults(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.session?.status;
      if (status === 'done' || status === 'failed') return false;
      return 2000;
    },
    enabled: !!sessionId,
  });

  const session = data?.session;
  const processed = session?.processed_count ?? 0;
  const total = session?.total_comments ?? totalComments;
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const status = session?.status;

  useEffect(() => {
    if (status === 'done') onComplete();
  }, [status, onComplete]);

  if (status === 'failed') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-red-600 font-medium text-lg">Analysis failed</p>
        <p className="text-gray-500 text-sm mt-2">Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Comments</h2>
        <p className="text-gray-500 text-sm">
          {processed} of {total} comments processed
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">{pct}%</p>

      {error && (
        <p className="text-center text-red-500 text-sm mt-4">Error fetching status. Retrying...</p>
      )}
    </div>
  );
}
