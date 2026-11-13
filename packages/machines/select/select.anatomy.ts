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
    readonly option: AnatomyPart;
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
      description: "Decorative: the open and close affordance; holds the theme's icon or your own content.",
    },
    content: {
      name: 'Content',
      description: 'The `listbox`, portaled and positioned under the trigger or the FormField box.',
    },
    option: { name: 'Option', description: 'An option of the list. Its content must not be interactive.' },
    optionIndicator: {
      name: 'Option indicator',
      description:
        "Decorative: the check (single) or box (multiple) of the selection; holds the theme's icon while its option is " +
        'selected, or your own content.',
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
