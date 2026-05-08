import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api/index.js';
import clsx from 'clsx';

export default function UploadZone({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback((accepted) => {
    setError(null);
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: () => setError('Only CSV and XLSX files up to 50MB are accepted.'),
  });

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(file, setUploadProgress);
      onUploadComplete(result);
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Comments</h2>
        <p className="text-gray-600">Upload a CSV or XLSX file with stakeholder comments. Each row's first column is treated as one comment.</p>
      </div>

      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <p className="text-xs text-blue-600 mt-2">Drop a different file to replace</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 font-medium">Drag and drop a CSV or XLSX file here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-6 w-full py-3 px-6 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading...' : 'Analyze Comments'}
      </button>
    </div>
  );
}
