import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Badge anatomy: the root, the shown text and the `+` of a truncated count. */
export const badgeAnatomy: Anatomy<
  'badge',
  { readonly root: AnatomyPart; readonly content: AnatomyPart; readonly maxIndicator: AnatomyPart }
> = defineAnatomy({
  block: 'badge',
  parts: {
    root: { name: 'Root', description: 'The root of the badge. It holds the shown text.' },
    content: { name: 'Content', description: 'The shown text: the content, or the maximum when truncated.' },
    maxIndicator: { name: 'Max indicator', description: 'The "+" that follows a truncated count.' },
  },
});
