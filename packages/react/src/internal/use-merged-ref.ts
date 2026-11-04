'use client';

import { useMemo, type Ref, type RefCallback } from 'react';
import { mergeRefs } from './merge-refs';

/**
 * The merged callback ref of {@link mergeRefs}, kept stable while the refs are the same, so React
 * does not detach and attach the node on every render.
 *
 * @param first - The first ref.
 * @param second - The second ref.
 * @param third - The third ref.
 * @returns One callback ref.
 */
export function useMergedRef<T>(
  first: Ref<T> | undefined,
  second: Ref<T> | undefined,
  third: Ref<T> | undefined,
): RefCallback<T> {
  return useMemo(() => mergeRefs(first, second, third), [first, second, third]);
}
