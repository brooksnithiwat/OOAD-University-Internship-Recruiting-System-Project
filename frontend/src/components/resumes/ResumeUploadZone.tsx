import React, { useCallback, useRef, useState } from 'react';
import { useUploadResume } from '../../hooks/useResumes';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const ResumeUploadZone: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const mutation = useUploadResume();

  const validate = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must not exceed 5MB';
    }
    return null;
  };

  const onFile = useCallback((file: File) => {
    setError(null);
    const v = validate(file);
    if (v) {
      setSelectedFile(null);
      setError(v);
      return;
    }
    setSelectedFile(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  const onBrowse = () => fileInputRef.current?.click();

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  const upload = async () => {
    if (!selectedFile) return;
    setError(null);
    setProgress(0);
    mutation.mutate(
      { file: selectedFile, onUploadProgress: (p) => setProgress(p) },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setProgress(0);
          window.alert('Upload successful');
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || 'Upload failed';
          setError(msg);
          window.alert(`Upload failed: ${msg}`);
        },
      },
    );
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'}`}
        onClick={onBrowse}
        role="button"
      >
        <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onChange} />
        <p className="text-sm text-gray-600">Drag & drop your PDF here, or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">Max size: 5MB. PDF only.</p>

        {selectedFile && (
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{selectedFile.name}</div>
                <div className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</div>
              </div>
              <div>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setError(null); }}
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); upload(); }}
                disabled={mutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {mutation.isPending ? `Uploading ${progress}%` : 'Upload'}
              </button>
            </div>

            {mutation.isPending && (
              <div className="mt-2 w-full bg-gray-100 rounded h-2 overflow-hidden">
                <div className="h-2 bg-blue-500" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default ResumeUploadZone;
