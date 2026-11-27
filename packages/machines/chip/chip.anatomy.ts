import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/**
 * Chip anatomy: a root that holds the content, a check while the chip is selectable and, while `removable`, a
 * remove button.
 */
export const chipAnatomy: Anatomy<
  'chip',
  {
    readonly root: AnatomyPart;
    readonly contentWrapper: AnatomyPart;
    readonly check: AnatomyPart;
    readonly remove: AnatomyPart;
  }
> = defineAnatomy({
  block: 'chip',
  parts: {
    root: { name: 'Root', description: 'The chip. It holds the content and the remove button; it has no role.' },
    contentWrapper: {
      name: 'Content wrapper',
      description:
        'Wraps the content, the text of the chip. It names the remove button. On a selectable chip it is a `button` with `aria-pressed`; otherwise a `span`.',
    },
    check: {
      name: 'Check',
      description:
        "Decorative: the mark of a selected chip; holds the theme's check icon. Rendered only inside a selectable chip.",
    },
    remove: {
      name: 'Remove',
      description:
        'The button that asks to remove the chip. Rendered only while the chip is removable and enabled. The element is always a `button`.',
    },
  },
});
