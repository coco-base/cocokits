import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/**
 * Select anatomy: a root, a trigger (with the placeholder or value and the dropdown icon) and a portaled list
 * of options, option groups and separators. The adapter decides who writes each part.
 */
export const selectAnatomy: Anatomy<
  'select',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly placeholder: AnatomyPart;
    readonly value: AnatomyPart;
    readonly dropdownIcon: AnatomyPart;
    readonly content: AnatomyPart;
    readonly header: AnatomyPart;
    readonly search: AnatomyPart;
    readonly empty: AnatomyPart;
    readonly footer: AnatomyPart;
    readonly count: AnatomyPart;
    readonly option: AnatomyPart;
    readonly optionLeading: AnatomyPart;
    readonly optionDescription: AnatomyPart;
    readonly optionIndicator: AnatomyPart;
    readonly optionContent: AnatomyPart;
    readonly optionGroup: AnatomyPart;
    readonly optionGroupLabel: AnatomyPart;
    readonly separator: AnatomyPart;
  }
> = defineAnatomy({
  block: 'select',
  parts: {
    root: { name: 'Root', description: 'The root. It renders the facts as `data-*`; it has no role.' },
    trigger: {
      name: 'Trigger',
      description: 'A `button` with role `combobox`. DOM focus stays on it while the list is open.',
    },
    placeholder: { name: 'Placeholder', description: 'The text shown while nothing is selected.' },
    value: {
      name: 'Value',
      description: 'The selection: the labels of the selected values joined, or the custom trigger content.',
    },
    dropdownIcon: {
      name: 'Dropdown icon',
      description: "Decorative: the open and close affordance; holds the theme's icon.",
    },
    content: {
      name: 'Content',
      description: 'The `listbox`, portaled and positioned under the trigger or the FormField box.',
    },
    header: {
      name: 'Header',
      description: 'The area above the options. It holds the search while the Select has a `filter`; it has no role.',
    },
    search: {
      name: 'Search',
      description:
        'A native `input type="search"` with role `combobox`. DOM focus stays in it while the list is open; typing narrows the options.',
    },
    empty: {
      name: 'Empty',
      description: 'The text shown while no option matches the query. A polite status.',
    },
    footer: {
      name: 'Footer',
      description: "The area below the options. It holds the author's actions and does not close the list.",
    },
    count: {
      name: 'Count',
      description: 'In the trigger of a multiple Select: `+N` for the selected values after the first one.',
    },
    option: { name: 'Option', description: 'An option of the list. Its content must not be interactive.' },
    optionLeading: {
      name: 'Option leading',
      description: 'Decorative: an icon or a picture before the text of an option; it holds the author content.',
    },
    optionDescription: {
      name: 'Option description',
      description: 'A smaller text under or beside the text of an option. It describes the option.',
    },
    optionIndicator: {
      name: 'Option indicator',
      description:
        "Decorative: the check (single) or box (multiple) of the selection; holds the theme's icon while its option is " +
        'selected.',
    },
    optionContent: { name: 'Option content', description: 'Holds the author content of an option.' },
    optionGroup: { name: 'Option group', description: 'Groups options under a label; role `group`.' },
    optionGroupLabel: { name: 'Option group label', description: 'The label of an option group: text or markup.' },
    separator: {
      name: 'Separator',
      description: 'Empty, decorative: a line between options or groups. Keys never land on it.',
    },
  },
});
