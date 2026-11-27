import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Tabs anatomy: a root around a list of triggers (with one indicator) and one panel per trigger. */
export const tabsAnatomy: Anatomy<
  'tabs',
  {
    readonly root: AnatomyPart;
    readonly list: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly triggerLabel: AnatomyPart;
    readonly indicator: AnatomyPart;
    readonly panel: AnatomyPart;
  }
> = defineAnatomy({
  block: 'tabs',
  parts: {
    root: { name: 'Root', description: 'The root. It holds the list and the panels and renders the orientation.' },
    list: { name: 'List', description: 'The `tablist`: it holds the triggers and the indicator.' },
    trigger: { name: 'Trigger', description: 'A `button` with role `tab` that selects its panel.' },
    triggerLabel: { name: 'Trigger label', description: 'The text or markup of a trigger.' },
    indicator: {
      name: 'Indicator',
      description:
        'Empty, decorative, one per list. The base writes `--active-tab-left`, `--active-tab-top`, ' +
        '`--active-tab-width` and `--active-tab-height` on it after mount: the box of the selected trigger.',
    },
    panel: { name: 'Panel', description: 'The `tabpanel` of one trigger; hidden while its trigger is not selected.' },
  },
});
