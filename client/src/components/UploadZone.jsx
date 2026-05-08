import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../api/index.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

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
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Upload Comments
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload a CSV or XLSX file. Each row&apos;s first column is treated as one comment.
      </Typography>

      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: 6,
          textAlign: 'center',
          cursor: 'pointer',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? 'primary.50' : 'background.paper',
          transition: 'border-color 0.2s, background-color 0.2s',
          '&:hover': { borderColor: 'primary.light' },
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <Box>
            <InsertDriveFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="body1" fontWeight={600}>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB — drop a different file to replace
            </Typography>
          </Box>
        ) : (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Drag and drop a CSV or XLSX file here
            </Typography>
            <Typography variant="caption" color="text.disabled">or click to browse</Typography>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}

      {uploading && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Uploading...</Typography>
            <Typography variant="caption" color="text.secondary">{uploadProgress}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleUpload}
        disabled={!file || uploading}
        sx={{ mt: 3 }}
      >
        {uploading ? 'Uploading...' : 'Analyze Comments'}
      </Button>
    </Box>
  );
}
