import type { ProjectAnnotations, Renderer } from '@storybook/types';
import { WithDocContainer } from './with-doc-container';
import { DocPage } from '../features/doc-page/doc-page';
import { WithStoryContainer } from './with-story-container';

/**
 * The `Preview` type is not globally exported and must be imported from a specific framework path (e.g., `@storybook/angular`).
 * This type extends `ProjectAnnotations` with a renderer and includes an additional `tags` property as an array of strings.
 * Users need to manually define this custom `Preview` type to include the `tags` property based on their specific requirements.
 */
type Preview = ProjectAnnotations<Renderer> & { tags: string[] };

export const preview: Preview = {
  decorators: [WithStoryContainer],
  tags: ['autodocs'],
  parameters: {
    docs: {
      container: WithDocContainer,
      page: DocPage,
    },
  },
};

export default preview;
export const globals = {};
