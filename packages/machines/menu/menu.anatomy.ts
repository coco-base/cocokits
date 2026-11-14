import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Menu anatomy: a provider root, the menu button, a portaled `menu` and its items. */
export const menuAnatomy: Anatomy<
  'menu',
  {
    readonly root: AnatomyPart;
    readonly trigger: AnatomyPart;
    readonly content: AnatomyPart;
    readonly item: AnatomyPart;
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
  },
});
