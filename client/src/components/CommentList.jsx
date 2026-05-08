import { useState, useRef, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getSessionComments } from '../api/index.js';
import CommentCard from './CommentCard.jsx';

export default function CommentList({ sessionId, filters }) {
  const [page, setPage] = useState(1);
  const limit = 20;

  // Reset to page 1 when filters change
  const filterKey = JSON.stringify(filters);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['comments', sessionId, filters, page],
    queryFn: () =>
      getSessionComments(sessionId, {
        sentiment: filters.sentiment || undefined,
        keyword: filters.keyword || undefined,
        page,
        limit,
      }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setPage(1);
      prevFilterKey.current = filterKey;
    }
  }, [filterKey]);

  const comments = data?.comments ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          Comments {total > 0 && <span className="text-gray-500 font-normal text-sm">({total} total)</span>}
        </h3>
        {isFetching && <span className="text-xs text-gray-400">Loading...</span>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No comments match your filters.</div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
