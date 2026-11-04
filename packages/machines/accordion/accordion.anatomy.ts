import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Accordion anatomy: a root around items; each item has a header with one trigger, and a content. */
export const accordionAnatomy: Anatomy<
  'accordion',
  {
    readonly root: AnatomyPart;
    readonly item: AnatomyPart;
    readonly header: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly content: AnatomyPart;
  }
> = defineAnatomy({
  block: 'accordion',
  parts: {
    root: {
      name: 'Root',
      description: 'The root. It holds the items and renders the orientation and the disabled state.',
    },
    item: { name: 'Item', description: 'One section: its header and its content.' },
    header: {
      name: 'Header',
      description: 'The heading (`h1` to `h6`, `h3` by default) that wraps the trigger.',
    },
    trigger: {
      name: 'Trigger',
      description: 'The native `button` that opens and closes its item. It is the only child of the header.',
    },
    content: {
      name: 'Content',
      description:
        'The section body, a `region` labelled by its trigger. The base writes `--accordion-content-height` and ' +
        '`--accordion-content-width` on it after mount, for the open and close animation.',
    },
  },
});
