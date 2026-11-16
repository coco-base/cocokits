// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dialog as BaseDialog } from '@cocokits/react/dialog';
import { Select as BaseSelect } from '@cocokits/react/select';
import { Tooltip as BaseTooltip } from '@cocokits/react/tooltip';
import { Chip, Dialog, Select, Tooltip } from '../src/index';
import { themed } from './helpers';

/** The parts the framework added: the layer shares them, and the theme styles them by their class alone. */
beforeEach(() => {
  Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 });
  const matches = Reflect.get(Element.prototype, 'matches') as (this: Element, selector: string) => boolean;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    if (selector === ':modal') return this.localName === 'dialog' && this.hasAttribute('data-modal');
    return matches.call(this, selector);
  });
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  Element.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.setAttribute('data-modal', '');
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('the new parts of the namespaces', () => {
  it.each([
    ['Dialog', Dialog, BaseDialog, ['Header', 'Body', 'Footer']],
    ['Tooltip', Tooltip, BaseTooltip, ['Title', 'Description']],
    [
      'Select',
      Select,
      BaseSelect,
      ['Header', 'Search', 'Empty', 'Footer', 'Count', 'OptionDescription', 'OptionLeading'],
    ],
  ] as const)('%s shares each new part with the base', (_name, themedNamespace, base, parts) => {
    for (const part of parts) {
      expect(themedNamespace[part as keyof typeof themedNamespace], part).toBe(base[part as keyof typeof base]);
    }
  });
});

describe('the new parts render their class and no theme attribute', () => {
  it('Dialog: header, body and footer', () => {
    render(
      themed(
        <Dialog.Root defaultOpen>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Panel</Dialog.Title>
              <Dialog.Close aria-label="Close">x</Dialog.Close>
            </Dialog.Header>
            <Dialog.Body>Text</Dialog.Body>
            <Dialog.Footer>Actions</Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>,
      ),
    );
    for (const part of ['header', 'body', 'footer']) {
      const element = document.querySelector(`.cck-dialog__${part}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
    }
    expect(document.querySelector('.cck-dialog__content')?.getAttribute('data-size')).toBe('md');
  });

  it('Tooltip: title and description', () => {
    render(
      themed(
        <Tooltip.Root defaultOpen>
          <Tooltip.Trigger>Copy</Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Title>Copy</Tooltip.Title>
            <Tooltip.Description>Copies the link</Tooltip.Description>
          </Tooltip.Content>
        </Tooltip.Root>,
      ),
    );
    for (const part of ['title', 'description']) {
      const element = document.querySelector(`.cck-tooltip__${part}`);
      expect(element, part).not.toBeNull();
      expect(element?.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual([]);
    }
  });

  it('Select: count in the trigger, then the header with the search, the empty message, the footer and the option parts', async () => {
    render(
      themed(
        <Select.Root multiple filter defaultValue={['a', 'b']}>
          <Select.Trigger aria-label="Dish">
            <Select.Value />
            <Select.Count />
            <Select.Icon />
          </Select.Trigger>
          <Select.Content>
            <Select.Header>
              <Select.Search aria-label="Search" />
            </Select.Header>
            <Select.Item value="a">
              <Select.OptionLeading>i</Select.OptionLeading>
              <Select.ItemText>
                Alpha
                <Select.OptionDescription>first</Select.OptionDescription>
              </Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="b">
              <Select.ItemText>Beta</Select.ItemText>
            </Select.Item>
            <Select.Empty>None</Select.Empty>
            <Select.Footer>Done</Select.Footer>
          </Select.Content>
        </Select.Root>,
      ),
    );
    expect(document.querySelector('.cck-select__count')?.textContent).toBe('+1');
    await userEvent.setup().click(screen.getByRole('combobox', { name: 'Dish' }));
    for (const part of ['header', 'search', 'footer', 'option-leading', 'option-description']) {
      expect(document.querySelector(`.cck-select__${part}`), part).not.toBeNull();
    }
    expect(document.querySelector('.cck-select__content')?.getAttribute('data-multiple')).not.toBeNull();
  });

  it('Chip: a selectable chip draws the check icon of the theme, then its content, then the remove button', () => {
    const ui: ReactElement = (
      <Chip selected onSelectedChange={() => undefined} removable onRemove={() => undefined} data-testid="chip">
        Pizza
      </Chip>
    );
    render(themed(ui));
    const check = document.querySelector('.cck-chip__check');
    expect(check?.getAttribute('data-state')).toBe('checked');
    expect(check?.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Pizza' }).getAttribute('aria-pressed')).toBe('true');
    const children = [...(document.querySelector('.cck-chip')?.children ?? [])];
    expect(children.map((child) => child.className.split(' ')[0])).toEqual([
      'cck-chip__check',
      'cck-chip__content-wrapper',
      'cck-chip__remove',
    ]);
  });
});
