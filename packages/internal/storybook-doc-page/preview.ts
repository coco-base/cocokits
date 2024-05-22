import type { ProjectAnnotations, Renderer } from '@storybook/types';

import { DocPage } from './src';

/**
 * The `Preview` type is not globally exported and must be imported from a specific framework path (e.g., `@storybook/angular`).
 * This type extends `ProjectAnnotations` with a renderer and includes an additional `tags` property as an array of strings.
 * Users need to manually define this custom `Preview` type to include the `tags` property based on their specific requirements.
 */
type Preview = ProjectAnnotations<Renderer> & { tags: string[] };

export const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: DocPage,
    },
  },
};

export default preview;
