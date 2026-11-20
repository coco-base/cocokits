import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** TabNav anatomy: a `nav` around a list of links that look like tabs, with one indicator, and an optional panel. */
export const tabNavAnatomy: Anatomy<
  'tab-nav',
  {
    readonly root: AnatomyPart;
    readonly list: AnatomyPart;
    readonly link: AnatomyPart;
    readonly indicator: AnatomyPart;
    readonly panel: AnatomyPart;
  }
> = defineAnatomy({
  block: 'tab-nav',
  parts: {
    root: { name: 'Root', description: 'The `nav` landmark. The author names it with `aria-label`.' },
    list: {
      name: 'List',
      description: 'Holds the links and the indicator. With a linked panel it is the `tablist`.',
    },
    link: {
      name: 'Link',
      description:
        'An `a` that navigates. The active one has `aria-current="page"` and there are no tab roles, unless a ' +
        'panel is linked: then the link is a `tab` with `aria-selected` and `aria-controls`.',
    },
    indicator: {
      name: 'Indicator',
      description:
        'Empty, decorative, one per list. The base writes `--active-tab-left`, `--active-tab-top`, ' +
        '`--active-tab-width` and `--active-tab-height` on it after mount: the box of the active link.',
    },
    panel: {
      name: 'Panel',
      description:
        'The `tabpanel` a linked nav controls, for links that drive a router outlet. It may sit anywhere in ' +
        'the page and is labelled by the active link.',
    },
  },
});
