import type {
  loadQuery as loadQueryType,
  useFragment as useFragmentType,
  usePreloadedQuery as usePreloadedQueryType,
  useMutation as useMutationType,
  usePaginationFragment as usePaginationFragmentType,
} from 'react-relay';
// @ts-expect-error
import loadQueryPkg from 'react-relay/lib/relay-hooks/loadQuery';
// @ts-expect-error
import useFragmentPkg from 'react-relay/lib/relay-hooks/useFragment';
// @ts-expect-error
import usePreloadedQueryPkg from 'react-relay/lib/relay-hooks/usePreloadedQuery';
// @ts-expect-error
import useMutationPkg from 'react-relay/lib/relay-hooks/useMutation';
// @ts-expect-error
import usePaginationFragmentPkg from 'react-relay/lib/relay-hooks/usePaginationFragment';

export const loadQuery = loadQueryPkg.loadQuery as typeof loadQueryType;
export const useFragment = useFragmentPkg as typeof useFragmentType;
export const usePreloadedQuery =
  usePreloadedQueryPkg as typeof usePreloadedQueryType;
export const useMutation = useMutationPkg as typeof useMutationType;
export const usePaginationFragment =
  usePaginationFragmentPkg as typeof usePaginationFragmentType;
