// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen, waitFor } from '@testing-library/vue';
import { h, ref, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckboxGroup } from '@cocokits/vue/checkbox-group';
import * as baseDialog from '@cocokits/vue/dialog';
import * as baseMenu from '@cocokits/vue/menu';
import * as baseSelect from '@cocokits/vue/select';
import * as baseTooltip from '@cocokits/vue/tooltip';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import * as theme from '../src/index';
import {
  Checkbox,
  Chip,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuItemIndicator,
  MenuItemLeading,
  MenuItemShortcut,
  MenuItemSupportingText,
  MenuItemTrailing,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRoot,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
  RadioGroup,
  Radio,
  SelectContent,
  SelectEmpty,
  SelectFooter,
  SelectHeader,
  SelectItem,
  SelectItemText,
  SelectOptionDescription,
  SelectOptionLeading,
  SelectRoot,
  SelectSearch,
  SelectTrigger,
  SelectValue,
  TooltipContent,
  TooltipDescription,
  TooltipRoot,
  TooltipTitle,
  TooltipTrigger,
} from '../src/index';
import { themed } from './helpers';

beforeEach(() => {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

const c = (component: unknown, props: Record<string, unknown> | null, children?: () => unknown): VNode =>
  h(component as Component, props, children as never);

describe('the parts of the layer are the base parts, except the ones with an option', () => {
  it.each([
    ['menu', baseMenu, ['MenuItem', 'MenuCheckboxItem', 'MenuRadioItem', 'MenuSubTrigger', 'MenuContent']],
    ['dialog', baseDialog, ['DialogRoot', 'DialogContent']],
    ['tooltip', baseTooltip, ['TooltipRoot', 'TooltipContent']],
    ['select', baseSelect, ['SelectRoot', 'SelectContent']],
  ] as const)('%s exports every base part, the themed ones apart', (_name, base, themedParts) => {
    const parts = Object.keys(base).filter((key) => /^[A-Z]/.test(key) && !key.endsWith('Props'));
    for (const part of parts) {
      expect(theme, part).toHaveProperty(part);
      if (!(themedParts as readonly string[]).includes(part)) {
        expect(Reflect.get(theme, part), part).toBe(Reflect.get(base, part));
      }
    }
    for (const part of themedParts.filter((p) => p === 'MenuItem' || p.startsWith('MenuC') || p.endsWith('Trigger'))) {
      expect(Reflect.get(theme, part), part).not.toBe(Reflect.get(base, part));
    }
  });
});

const itemColor = cocokitsThemeConfig.components.menu.color;
const menuWith = (props: Record<string, unknown>, size?: string): VNode =>
  c(MenuRoot, null, () => [
    c(MenuTrigger, null, () => 'Actions'),
    c(MenuContent, size ? { size } : null, () => [
      c(MenuItem, props, () => 'Rename'),
      c(MenuCheckboxItem, props, () => [c(MenuItemIndicator, null), 'Hidden']),
      c(MenuRadioGroup, null, () => c(MenuRadioItem, { value: 'a', ...props }, () => 'A')),
      c(MenuSub, null, () => [
        c(MenuSubTrigger, props, () => 'Share'),
        c(MenuSubContent, null, () => c(MenuItem, null, () => 'Email')),
      ]),
    ]),
  ]);
const itemElements = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>('[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio]'),
];
async function openMenu(component: Component): Promise<HTMLElement> {
  render(component);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Actions' }));
  const content = document.querySelector<HTMLElement>('.cck-menu__content');
  if (!content) throw new Error('no .cck-menu__content');
  return content;
}

describe('theme menu items: color', () => {
  it('has a color option on the four kinds of item that defaults to default', () => {
    expect(itemColor.attrName).toBe('color');
    expect(itemColor.default).toBe('default');
    expect(itemColor.values).toEqual(['default', 'danger']);
  });

  it.each([
    ['the config default', {}, 'default'],
    ['color default', { color: 'default' }, 'default'],
    ['color danger', { color: 'danger' }, 'danger'],
  ])('renders %s as data-color on each of the four kinds of item', async (_name, props, expected) => {
    await openMenu(themed(() => menuWith(props)));
    const elements = itemElements().slice(0, 4);
    expect(elements.map((element) => element.getAttribute('role'))).toEqual([
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'menuitem',
    ]);
    for (const element of elements) expect(element.getAttribute('data-color')).toBe(expected);
  });

  it('removes the attribute with null and keeps it off the content', async () => {
    const content = await openMenu(themed(() => menuWith({ color: null })));
    for (const element of itemElements().slice(0, 4)) expect(element.hasAttribute('data-color')).toBe(false);
    expect(content.hasAttribute('data-color')).toBe(false);
  });

  it('lets a provider override win over the default, and the own prop over the override', async () => {
    await openMenu(themed(() => menuWith({}), { menu: { color: 'danger' } }));
    expect(itemElements()[0]?.getAttribute('data-color')).toBe('danger');
    cleanup();
    await openMenu(themed(() => menuWith({ color: 'default' }), { menu: { color: 'danger' } }));
    expect(itemElements()[0]?.getAttribute('data-color')).toBe('default');
  });

  it('renders no theme attribute without a provider', async () => {
    await openMenu(menuWith({ color: 'danger' }));
    for (const element of itemElements().slice(0, 4)) expect(element.hasAttribute('data-color')).toBe(false);
  });

  it('forwards select and keeps the base behaviour of the checkbox item (v-model, default checked)', async () => {
    const onSelect = vi.fn();
    const checked = ref<boolean | undefined>(undefined);
    await openMenu(
      themed(() =>
        c(MenuRoot, null, () => [
          c(MenuTrigger, null, () => 'Actions'),
          c(MenuContent, null, () => [
            c(MenuItem, { onSelect }, () => 'Rename'),
            c(
              MenuCheckboxItem,
              {
                modelValue: checked.value,
                'onUpdate:modelValue': (value: boolean) => {
                  checked.value = value;
                },
              },
              () => 'Hidden',
            ),
            c(MenuCheckboxItem, { defaultChecked: true }, () => 'Grid'),
          ]),
        ]),
      ),
    );
    expect(screen.getByRole('menuitemcheckbox', { name: 'Grid' }).getAttribute('aria-checked')).toBe('true');
    await userEvent.setup().click(screen.getByRole('menuitemcheckbox', { name: 'Hidden' }));
    expect(checked.value).toBe(true);
  });

  it('gives the submenu content the size of the menu that holds its sub-trigger', async () => {
    const content = await openMenu(themed(() => menuWith({}, 'lg')));
    // The open moves the focus into the menu in the next frame; a focus set before that frame is taken back.
    await waitFor(() => {
      expect(content.contains(document.activeElement)).toBe(true);
    });
    screen.getByRole('menuitem', { name: 'Share' }).focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    expect(document.querySelector('.cck-menu__sub-content')?.getAttribute('data-size')).toBe('lg');
  });

  it('keeps the item parts as base parts with no theme attribute', async () => {
    await openMenu(
      themed(() =>
        c(MenuRoot, null, () => [
          c(MenuTrigger, null, () => 'Actions'),
          c(MenuContent, null, () =>
            c(MenuCheckboxItem, null, () => [
              c(MenuItemIndicator, null),
              c(MenuItemLeading, null, () => 'L'),
              'Hidden',
              c(MenuItemSupportingText, null, () => 's'),
              c(MenuItemShortcut, null, () => 'K'),
              c(MenuItemTrailing, null, () => 'T'),
            ]),
          ),
        ]),
      ),
    );
    for (const part of ['item-indicator', 'item-leading', 'item-supporting-text', 'item-shortcut', 'item-trailing']) {
      const element = document.querySelector(`.cck-menu__${part}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttributeNames().filter((name) => name.startsWith('data-') && name !== 'data-state')).toEqual(
        [],
      );
    }
  });
});

describe('the Chip forwards the new props of the base', () => {
  it('a selectable chip: the toggle, the check icon of the theme, then the content, then the remove button', () => {
    const selected = ref(true);
    render(
      themed(() =>
        c(
          Chip,
          {
            selected: selected.value,
            'onUpdate:selected': (value: boolean) => {
              selected.value = value;
            },
            removable: true,
            removeLabel: 'Drop pizza',
          },
          () => 'Pizza',
        ),
      ),
    );
    const chip = document.querySelector('.cck-chip');
    expect([...(chip?.children ?? [])].map((child) => child.className.split(' ')[0])).toEqual([
      'cck-chip__check',
      'cck-chip__content-wrapper',
      'cck-chip__remove',
    ]);
    expect(chip?.querySelector('.cck-chip__check svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Pizza' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Drop pizza' })).toBeTruthy();
  });

  it('writes the selected model back, and starts from default-selected', async () => {
    const selected = ref(false);
    render(
      themed(() => [
        c(
          Chip,
          {
            selected: selected.value,
            'onUpdate:selected': (value: boolean) => {
              selected.value = value;
            },
          },
          () => 'One',
        ),
        c(Chip, { defaultSelected: true }, () => 'Two'),
      ]),
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'One' }));
    expect(selected.value).toBe(true);
    expect(screen.getByRole('button', { name: 'Two' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('a plain chip has no toggle and no check', () => {
    render(themed(() => c(Chip, null, () => 'Plain')));
    expect(document.querySelector('.cck-chip__check')).toBeNull();
    expect(document.querySelector('.cck-chip__content-wrapper')?.hasAttribute('aria-pressed')).toBe(false);
  });
});

describe('the Dialog root forwards the config of the base', () => {
  it('passes role, disable-close and the size members to the content', async () => {
    render(
      themed(() =>
        c(
          DialogRoot,
          { defaultOpen: true, role: 'alertdialog', width: 400, minHeight: '10rem', disableClose: true },
          () =>
            c(DialogContent, null, () => [
              c(DialogHeader, null, () => c(DialogTitle, null, () => 'Panel')),
              c(DialogBody, null, () => 'Text'),
              c(DialogFooter, null, () => 'Actions'),
            ]),
        ),
      ),
    );
    await waitFor(() => {
      expect(document.querySelector('.cck-dialog__content')).not.toBeNull();
    });
    const content = document.querySelector<HTMLElement>('.cck-dialog__content');
    expect(content?.getAttribute('role')).toBe('alertdialog');
    expect(content?.style.width).toBe('400px');
    expect(content?.style.minHeight).toBe('10rem');
    expect(content?.getAttribute('data-size')).toBe('md');
    for (const part of ['header', 'body', 'footer']) {
      const element = document.querySelector(`.cck-dialog__${part}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
    }
  });
});

describe('the RadioGroup forwards touched', () => {
  it.each([
    ['required, touched and no value', { required: true, touched: true }, true],
    ['required and not touched', { required: true }, false],
  ])('%s: the invalid state is %s', (_name, props, invalid) => {
    render(themed(() => c(RadioGroup, { ariaLabel: 'Size', ...props }, () => c(Radio, { value: 'a' }, () => 'A'))));
    const group = screen.getByRole('radiogroup');
    expect(group.getAttribute('aria-invalid') === 'true').toBe(invalid);
    expect(group.hasAttribute('data-invalid')).toBe(invalid);
  });
});

describe('the Select forwards filter and draws the new parts', () => {
  it('filter: the header with the search, the empty message, the footer and the option parts', async () => {
    render(
      themed(() =>
        c(SelectRoot, { filter: true, multiple: true, modelValue: ['a', 'b'] }, () => [
          c(SelectTrigger, { ariaLabel: 'Dish' }, () => [c(SelectValue, null)]),
          c(SelectContent, null, () => [
            c(SelectHeader, null, () => c(SelectSearch, { ariaLabel: 'Search' })),
            c(SelectItem, { value: 'a' }, () => [
              c(SelectOptionLeading, null, () => 'i'),
              c(SelectItemText, null, () => ['Alpha', c(SelectOptionDescription, null, () => 'first')]),
            ]),
            c(SelectItem, { value: 'b' }, () => c(SelectItemText, null, () => 'Beta')),
            c(SelectEmpty, null, () => 'None'),
            c(SelectFooter, null, () => 'Done'),
          ]),
        ]),
      ),
    );
    expect(document.querySelector('.cck-select__count')?.textContent).toBe('+1');
    const trigger = document.querySelector<HTMLElement>('.cck-select__trigger');
    if (!trigger) throw new Error('no trigger');
    await userEvent.setup().click(trigger);
    for (const part of ['header', 'search', 'footer', 'option-leading', 'option-description']) {
      expect(document.querySelector(`.cck-select__${part}`), part).not.toBeNull();
    }
  });
});

describe('the Tooltip title and description', () => {
  it('render their class and no theme attribute', async () => {
    render(
      themed(() =>
        c(TooltipRoot, { defaultOpen: true }, () => [
          c(TooltipTrigger, null, () => 'Copy'),
          c(TooltipContent, null, () => [
            c(TooltipTitle, null, () => 'Copy'),
            c(TooltipDescription, null, () => 'Copies the link'),
          ]),
        ]),
      ),
    );
    await waitFor(() => {
      expect(document.querySelector('.cck-tooltip__title')).not.toBeNull();
    });
    for (const part of ['title', 'description']) {
      const element = document.querySelector(`.cck-tooltip__${part}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
    }
  });
});

describe('the themed Checkbox in a CheckboxGroup', () => {
  it('follows the list of the group and keeps its theme attributes', async () => {
    const value = ref(['a']);
    render(
      themed(() =>
        c(
          CheckboxGroup,
          {
            ariaLabel: 'Toppings',
            modelValue: value.value,
            'onUpdate:modelValue': (next: string[]) => {
              value.value = next;
            },
          },
          () => [c(Checkbox, { value: 'a' }, () => 'Ham'), c(Checkbox, { value: 'b', size: 'lg' }, () => 'Pineapple')],
        ),
      ),
    );
    expect(document.querySelector('.cck-checkbox-group')?.getAttribute('role')).toBe('group');
    const boxes = screen.getAllByRole<HTMLInputElement>('checkbox');
    expect(boxes.map((box) => box.checked)).toEqual([true, false]);
    expect(document.querySelectorAll('.cck-checkbox')[1].getAttribute('data-size')).toBe('lg');
    await userEvent.setup().click(boxes[1]);
    expect(value.value).toEqual(['a', 'b']);
  });
});
