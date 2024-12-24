import type { ProjectAnnotations, Renderer } from '@storybook/types';
import { WithThemeProvider } from './with-theme-provider';
import { WithStoryDecorator } from './with-story-decorator';
import { StoryDocPage } from '../features/story-doc-page/story-doc-page';

/**
 * The `Preview` type is not globally exported and must be imported from a specific framework path (e.g., `@storybook/angular`).
 * This type extends `ProjectAnnotations` with a renderer and includes an additional `tags` property as an array of strings.
 * Users need to manually define this custom `Preview` type to include the `tags` property based on their specific requirements.
 */
type Preview = ProjectAnnotations<Renderer> & { tags: string[] };

export const preview: Preview = {
  decorators: [WithStoryDecorator],
  tags: ['autodocs'],
  parameters: {
    docs: {
      container: WithThemeProvider,
      page: StoryDocPage,
    },
  },
};

export default preview;
export const globals = {};
