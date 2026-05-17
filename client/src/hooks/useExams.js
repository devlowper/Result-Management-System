import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examApi } from '../api';
import toast from 'react-hot-toast';

export function useExams(params) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => examApi.list(params).then((r) => r.data),
    staleTime: 30 * 1000,
  });
}

export function useExam(id) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => examApi.create(data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries(['exams']); toast.success('Exam created!'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to create exam'),
  });
}

export function usePublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => examApi.publish(id).then((r) => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries(['exams']);
      qc.invalidateQueries(['exam', id]);
      toast.success('Exam published! Cache warm-up started.');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to publish'),
  });
}

export function useUnpublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => examApi.unpublish(id).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries(['exams']); toast.success('Exam unpublished.'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to unpublish'),
  });
}
