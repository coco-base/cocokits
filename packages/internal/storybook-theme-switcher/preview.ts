import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { withGlobals } from './src/lib/componenets/withGlobals';
import { GLOBAL_THEME_ID } from './src/lib/config/constants';

export const preview: ProjectAnnotations<Renderer> = {
  decorators: [withGlobals],
};

export default preview;
export const globals = { [GLOBAL_THEME_ID]: window.localStorage.getItem(GLOBAL_THEME_ID) };
