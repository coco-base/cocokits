import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { GLOBAL_THEME_ID } from './src';
import { withGlobals } from './src/lib/componenets/withGlobals';

export const preview: ProjectAnnotations<Renderer> = {
  decorators: [withGlobals],
};

export default preview;
export const globals = { [GLOBAL_THEME_ID]: window.localStorage.getItem(GLOBAL_THEME_ID) };
