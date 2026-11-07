'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser and `useEffect` on the server, so a server render does not warn. The
 * `typeof document` check at module level is the one environment check allowed there.
 */
export const useIsomorphicLayoutEffect: typeof useLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;
