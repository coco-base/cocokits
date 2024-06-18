import { useEffect, useState } from '@storybook/preview-api';

import { useSelectedStorybookTheme } from './useSelectedStorybookTheme.utils';

export function usePreviewSelectedStorybookTheme() {
  return useSelectedStorybookTheme({ useEffect, useState });
}
