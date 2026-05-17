import { useQuery } from '@tanstack/react-query';
import { resultApi } from '../api';

export function useResult(roll, examId, enabled = true) {
  return useQuery({
    queryKey: ['result', roll, examId],
    queryFn: () => resultApi.get(roll, examId).then((r) => r.data),
    enabled: enabled && !!roll && !!examId,
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  });
}
