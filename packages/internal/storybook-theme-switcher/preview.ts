import type { ProjectAnnotations, Renderer } from '@storybook/types';

// import './src/lib/styles/themes.scss';
import { withGlobals } from './src/lib/componenets/withGlobals';
import { GLOBAL_THEME_KEY } from './src/lib/config/constants';

export const preview: ProjectAnnotations<Renderer> = {
  decorators: [withGlobals],
};

export default preview;
export const globals = { [GLOBAL_THEME_KEY]: window.localStorage.getItem(GLOBAL_THEME_KEY) };
