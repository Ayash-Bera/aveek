import clsx from 'clsx';

const SENTIMENT_STYLES = {
  positive: { badge: 'bg-green-100 text-green-800', border: 'border-green-200' },
  negative: { badge: 'bg-red-100 text-red-800', border: 'border-red-200' },
  neutral: { badge: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
};

export default function CommentCard({ comment }) {
  const style = SENTIMENT_STYLES[comment.sentiment] || SENTIMENT_STYLES.neutral;
  const score = comment.sentiment_score != null ? comment.sentiment_score.toFixed(2) : '—';

  return (
    <div className={clsx('bg-white rounded-lg border p-4', style.border)}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', style.badge)}>
          {comment.sentiment ?? 'unanalyzed'}
        </span>
        <span className="text-xs text-gray-400 shrink-0">score: {score}</span>
      </div>
      {comment.summary && (
        <p className="text-sm font-medium text-gray-800 mb-1">{comment.summary}</p>
      )}
      <p className="text-sm text-gray-500 line-clamp-3">{comment.body}</p>
    </div>
  );
}
