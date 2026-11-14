import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Dialog anatomy: a provider root, a trigger, and a native modal dialog with a title, a description and a Close. */
export const dialogAnatomy: Anatomy<
  'dialog',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly content: AnatomyPart;
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
    title: { name: 'Title', description: 'The heading that names the dialog.' },
    description: { name: 'Description', description: 'The text that describes the dialog.' },
    close: { name: 'Close', description: 'A `button` that closes the dialog.' },
  },
});
