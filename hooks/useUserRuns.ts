import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  type RunPeriod,
  type RunRow,
  fetchRunsForUser,
  periodStartIso,
} from '@/lib/runs';

export function useUserRuns(period: RunPeriod) {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const fromIso = periodStartIso(period);

  return useQuery({
    queryKey: ['runs', 'list', userId, fromIso ?? 'all'],
    queryFn: () => fetchRunsForUser(userId!, fromIso),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export type { RunRow, RunPeriod };
