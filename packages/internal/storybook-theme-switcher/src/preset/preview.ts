import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { withStorybookThemeSwitcher } from '../lib/componenets/withStorybookThemeSwitcher';

export const preview: ProjectAnnotations<Renderer> = {
  decorators: [withStorybookThemeSwitcher],
};

export default preview;
export const globals = {};
