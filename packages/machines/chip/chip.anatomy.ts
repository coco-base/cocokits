import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Chip anatomy: a root that holds the content and, while `removable`, a remove button. */
export const chipAnatomy: Anatomy<
  'chip',
  {
    readonly root: AnatomyPart;
    readonly contentWrapper: AnatomyPart;
    readonly remove: AnatomyPart;
  }
> = defineAnatomy({
  block: 'chip',
  parts: {
    root: { name: 'Root', description: 'The chip. It holds the content and the remove button; it has no role.' },
    contentWrapper: {
      name: 'Content wrapper',
      description: 'Wraps the content, the text of the chip. It names the remove button.',
    },
    remove: {
      name: 'Remove',
      description:
        'The button that asks to remove the chip. Rendered only while the chip is removable. The element is always a `button`.',
    },
  },
});
