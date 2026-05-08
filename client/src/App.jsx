import { useState } from 'react';
import UploadZone from './components/UploadZone.jsx';
import JobPoller from './components/JobPoller.jsx';
import AnalysisDashboard from './components/AnalysisDashboard.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [totalComments, setTotalComments] = useState(0);
  const [view, setView] = useState('upload'); // 'upload' | 'polling' | 'dashboard'

  function handleUploadComplete({ sessionId, jobId, totalComments }) {
    setSessionId(sessionId);
    setJobId(jobId);
    setTotalComments(totalComments);
    setView('polling');
  }

  function handleAnalysisComplete() {
    setView('dashboard');
  }

  function handleReset() {
    setSessionId(null);
    setJobId(null);
    setTotalComments(0);
    setView('upload');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Stakeholder Comment Analysis</h1>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === 'upload' && (
          <UploadZone onUploadComplete={handleUploadComplete} />
        )}
        {view === 'polling' && (
          <JobPoller
            sessionId={sessionId}
            totalComments={totalComments}
            onComplete={handleAnalysisComplete}
          />
        )}
        {view === 'dashboard' && (
          <ErrorBoundary>
            <AnalysisDashboard sessionId={sessionId} onReset={handleReset} />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}
