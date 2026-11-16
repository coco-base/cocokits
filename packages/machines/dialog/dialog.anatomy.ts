import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/**
 * Dialog anatomy: a provider root, a trigger, and a native modal dialog with a header (the title and the Close),
 * a body (the description and the content) and a footer (the actions).
 */
export const dialogAnatomy: Anatomy<
  'dialog',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly content: AnatomyPart;
    readonly header: AnatomyPart;
    readonly body: AnatomyPart;
    readonly footer: AnatomyPart;
    readonly title: AnatomyPart;
    readonly description: AnatomyPart;
    readonly close: AnatomyPart;
  }
> = defineAnatomy({
  block: 'dialog',
  parts: {
    root: { name: 'Root', description: 'Renders no element: it provides the open state to its parts.' },
    trigger: { name: 'Trigger', description: 'The `button` that opens the dialog.' },
    content: {
      name: 'Content',
      description:
        'The native `dialog` opened with `showModal()`, portaled. Its `::backdrop` is the backdrop; there is no part.',
    },
    header: {
      name: 'Header',
      description: 'The top row of the content: it holds the Title and the Close. It has no role.',
    },
    body: {
      name: 'Body',
      description: 'The middle of the content: the description and the author content. It has no role.',
    },
    footer: { name: 'Footer', description: 'The bottom row of the content: it holds the actions. It has no role.' },
    title: { name: 'Title', description: 'The heading that names the dialog.' },
    description: { name: 'Description', description: 'The text that describes the dialog.' },
    close: { name: 'Close', description: 'A `button` that closes the dialog.' },
  },
});
