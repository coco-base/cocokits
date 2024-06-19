import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { withCckThemeSwitcher } from '../lib/componenets/withCckThemeSwitcher';
import { withStorybookThemeSwitcher } from '../lib/componenets/withStorybookThemeSwitcher';

export const preview: ProjectAnnotations<Renderer> = {
  decorators: [withStorybookThemeSwitcher, withCckThemeSwitcher],
};

export default preview;
export const globals = {};
