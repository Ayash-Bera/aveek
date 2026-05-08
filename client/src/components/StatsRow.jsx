import clsx from 'clsx';

const STATS = [
  { key: 'total', label: 'Total Comments', color: 'text-gray-900', bg: 'bg-white' },
  { key: 'positive', label: 'Positive', color: 'text-green-700', bg: 'bg-green-50' },
  { key: 'negative', label: 'Negative', color: 'text-red-700', bg: 'bg-red-50' },
  { key: 'neutral', label: 'Neutral', color: 'text-gray-700', bg: 'bg-gray-50' },
];

export default function StatsRow({ sentimentCounts, total }) {
  const values = { total, ...sentimentCounts };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map(({ key, label, color, bg }) => (
        <div key={key} className={clsx('rounded-lg border border-gray-200 p-5', bg)}>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={clsx('text-3xl font-bold mt-1', color)}>{values[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}
