import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Menu anatomy: a provider root, the menu button, a portaled `menu` and its items. */
export const menuAnatomy: Anatomy<
  'menu',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly content: AnatomyPart;
    readonly item: AnatomyPart;
    readonly checkboxItem: AnatomyPart;
    readonly radioGroup: AnatomyPart;
    readonly radioItem: AnatomyPart;
    readonly itemIndicator: AnatomyPart;
    readonly group: AnatomyPart;
    readonly groupLabel: AnatomyPart;
    readonly itemLeading: AnatomyPart;
    readonly itemTrailing: AnatomyPart;
    readonly itemSupportingText: AnatomyPart;
    readonly itemShortcut: AnatomyPart;
    readonly sub: AnatomyPart;
    readonly subTrigger: AnatomyPart;
    readonly subContent: AnatomyPart;
  }
> = defineAnatomy({
  block: 'menu',
  parts: {
    root: { name: 'Root', description: 'Renders no element: it holds the open state and links its parts.' },
    trigger: {
      name: 'Trigger',
      description:
        'The menu button, a native `button`. It opens and closes the menu and gets focus back when it closes.',
    },
    content: {
      name: 'Content',
      description:
        'The panel of actions, portaled next to the trigger. Role `menu`; focus moves into it on open and back to the trigger on close.',
    },
    item: {
      name: 'Item',
      description:
        'One action. Role `menuitem`; the active item is the one tab stop. A disabled item stays focusable and runs nothing.',
    },
    checkboxItem: {
      name: 'Checkbox item',
      description:
        'An item that toggles a state. Role `menuitemcheckbox` with `aria-checked`; Enter toggles it and closes the menu, Space toggles it and keeps the menu open.',
    },
    radioGroup: {
      name: 'Radio group',
      description: 'Groups radio items that share one value. Role `group`, named by its group label when there is one.',
    },
    radioItem: {
      name: 'Radio item',
      description:
        'An item that sets the value of its radio group. Role `menuitemradio` with `aria-checked`; Enter checks it and closes the menu, Space checks it and keeps the menu open.',
    },
    itemIndicator: {
      name: 'Item indicator',
      description:
        "Decorative: the check or the dot of a checkbox or radio item; holds the theme's icon while its item is checked.",
    },
    group: {
      name: 'Group',
      description: 'Groups related items under a group label. Role `group`, named by its group label.',
    },
    groupLabel: { name: 'Group label', description: 'The label of a group: text or markup. It is not an item.' },
    itemLeading: {
      name: 'Item leading',
      description: 'Decorative: an icon or a picture before the text of an item. The text of the item names it.',
    },
    itemTrailing: {
      name: 'Item trailing',
      description: 'Decorative: an icon or a picture after the text of an item. The text of the item names it.',
    },
    itemSupportingText: {
      name: 'Item supporting text',
      description: 'A smaller text under the text of an item. It describes the item.',
    },
    itemShortcut: { name: 'Item shortcut', description: 'The keyboard shortcut of an item, as text.' },
    sub: { name: 'Sub', description: 'Renders no element: it holds the open state of a submenu and links its parts.' },
    subTrigger: {
      name: 'Sub-trigger',
      description:
        'An item that opens a submenu. Role `menuitem` with `aria-haspopup="menu"` and `aria-expanded`; a press never runs it.',
    },
    subContent: {
      name: 'Sub-content',
      description:
        'The panel of a submenu, portaled next to the sub-trigger. Role `menu`, named by the sub-trigger; closing returns focus to the sub-trigger.',
    },
  },
});
