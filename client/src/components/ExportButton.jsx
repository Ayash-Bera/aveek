import { getExportUrl } from '../api/index.js';

export default function ExportButton({ sessionId }) {
  return (
    <a
      href={getExportUrl(sessionId)}
      download="results.csv"
      className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors inline-flex items-center gap-2"
    >
      Download CSV
    </a>
  );
}
