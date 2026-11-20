import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Popover anatomy: a provider root, a trigger, an optional anchor, portaled non-modal content with a title and a description, and a Close. */
export const popoverAnatomy: Anatomy<
  'popover',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly anchor: AnatomyPart;
    readonly content: AnatomyPart;
    readonly arrow: AnatomyPart;
    readonly title: AnatomyPart;
    readonly description: AnatomyPart;
    readonly close: AnatomyPart;
  }
> = defineAnatomy({
  block: 'popover',
  parts: {
    root: { name: 'Root', description: 'Renders no element: it provides the open state to its parts.' },
    trigger: { name: 'Trigger', description: 'The `button` that toggles the popover.' },
    anchor: {
      name: 'Anchor',
      description: 'An optional element the content is placed against instead of the trigger. It has no role.',
    },
    content: {
      name: 'Content',
      description:
        'A `dialog` positioned next to the trigger, portaled; non-modal unless the adapter makes it modal. Focus moves into it on open and back on close.',
    },
    arrow: {
      name: 'Arrow',
      description:
        'An optional decorative pointer inside the content. The positioning module places it on the edge facing the anchor.',
    },
    title: { name: 'Title', description: 'The heading that names the popover.' },
    description: { name: 'Description', description: 'The text that describes the popover.' },
    close: { name: 'Close', description: 'A `button` that closes the popover.' },
  },
});
