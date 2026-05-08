import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const uploadFile = (file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  }).then((r) => r.data);
};

export const analyzeText = (text) =>
  api.post('/analyze/text', { text }).then((r) => r.data);

export const getJob = (jobId) =>
  api.get(`/jobs/${jobId}`).then((r) => r.data);

export const getSessionResults = (sessionId) =>
  api.get(`/sessions/${sessionId}/results`).then((r) => r.data);

export const getSessionComments = (sessionId, params) =>
  api.get(`/sessions/${sessionId}/comments`, { params }).then((r) => r.data);

export const deleteSession = (sessionId) =>
  api.delete(`/sessions/${sessionId}`).then((r) => r.data);

export const getExportUrl = (sessionId) => `/api/sessions/${sessionId}/export`;
