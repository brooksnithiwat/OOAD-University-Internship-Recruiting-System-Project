import axios from '../lib/axios';
import type { AxiosProgressEvent } from 'axios';

export type ResumeRecord = {
  resumeId: string;
  studentId: string;
  fileName: string;
  fileRef: string;
  fileSizeBytes: number;
  mimeType: string;
  virusScanStatus: 'PENDING' | 'CLEAN' | 'INFECTED';
  uploadedAt: string;
};

export const uploadResume = async (
  file: File,
  onUploadProgress?: (progress: number) => void,
) => {
  const form = new FormData();
  form.append('file', file);

  const res = await axios.post('/resumes/upload', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (ev: AxiosProgressEvent) => {
      if (onUploadProgress && ev.total) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        onUploadProgress(pct);
      }
    },
  });

  return res.data;
};

export const getMyResumes = async (): Promise<ResumeRecord[]> => {
  const res = await axios.get('/resumes');
  return res.data as ResumeRecord[];
};

export const deleteResume = async (resumeId: string) => {
  const res = await axios.delete(`/resumes/${resumeId}`);
  return res.data as { message: string };
};

export default { uploadResume, getMyResumes, deleteResume };
