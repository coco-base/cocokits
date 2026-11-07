import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Tooltip anatomy: a provider root, the author's trigger and portaled content that never takes focus, with an optional arrow. */
export const tooltipAnatomy: Anatomy<
  'tooltip',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly content: AnatomyPart;
    readonly arrow: AnatomyPart;
  }
> = defineAnatomy({
  block: 'tooltip',
  parts: {
    root: { name: 'Root', description: 'Renders no element: it provides the open state to its parts.' },
    trigger: {
      name: 'Trigger',
      description: 'The focusable element the tooltip describes. The author chooses it; the default is a `button`.',
    },
    content: {
      name: 'Content',
      description: 'The `tooltip` bubble, portaled. It is not interactive and never takes focus.',
    },
    arrow: {
      name: 'Arrow',
      description:
        'An optional decorative pointer inside the content. The positioning module places it on the edge facing the anchor.',
    },
  },
});
