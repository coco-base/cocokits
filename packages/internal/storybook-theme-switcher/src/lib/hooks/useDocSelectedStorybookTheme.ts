import { useEffect, useState } from 'react';

import { useSelectedStorybookTheme } from './useSelectedStorybookTheme.utils';

export function useDocSelectedStorybookTheme() {
  return useSelectedStorybookTheme({ useEffect, useState });
}
