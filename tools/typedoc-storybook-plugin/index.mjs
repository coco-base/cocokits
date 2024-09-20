import { Application } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';
import { StorybookMarkdownTheme } from './storybook-markdown-theme.mjs';
import { getStorybookPageContent } from './template.mjs';

/**
 * @param app {Application}
 */
export function load(app) {
  app.renderer.defineTheme('storybook-markdown-theme', StorybookMarkdownTheme);

  app.renderer.on(MarkdownPageEvent.END, (event) => {
    event.contents = getStorybookPageContent(app, event);
  });
}


