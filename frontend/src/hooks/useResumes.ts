import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as resumeService from '../services/resume.service';

export const RESUMES_KEY = ['resumes', 'my'] as const;

export function useMyResumes() {
  return useQuery({
    queryKey: RESUMES_KEY,
    queryFn: () => resumeService.getMyResumes(),
    staleTime: 1000 * 30,
  });
}

type UploadVars = {
  file: File;
  onUploadProgress?: (pct: number) => void;
};

type DeleteVars = {
  resumeId: string;
};

export function useUploadResume() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ file, onUploadProgress }: UploadVars) =>
      resumeService.uploadResume(file, onUploadProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESUMES_KEY });
    },
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId }: DeleteVars) => resumeService.deleteResume(resumeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESUMES_KEY });
    },
  });
}
