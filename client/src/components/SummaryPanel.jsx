export default function SummaryPanel({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
      <h3 className="font-semibold text-blue-900 mb-3">Executive Summary</h3>
      <p className="text-blue-800 leading-relaxed">{summary}</p>
    </div>
  );
}
