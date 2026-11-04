// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, render, screen, waitFor } from '@testing-library/vue';
import { defineComponent, h, nextTick, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import {
  Checkbox,
  Radio,
  SelectRoot,
  Switch,
  TabNavLink,
  TabNavRoot,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Textarea,
} from '../src/index';
import { item, selectParts } from './select-parts';

beforeEach(() => {
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement): void {
    this.style.display = 'block';
  };
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    },
  );
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const themed = (renderFn: () => VNode | VNode[]): Component =>
  defineComponent({ setup: () => () => h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, renderFn) });

const tabs = (props: Record<string, unknown>): VNode =>
  h(TabsRoot as Component, props, () => [
    h(TabsList, { 'aria-label': 'Account settings' }, () => [
      h(TabsTrigger, { value: 'account' }, () => 'Account'),
      h(TabsTrigger, { value: 'password' }, () => 'Password'),
    ]),
    h(TabsContent, { value: 'account' }, () => 'Change your name.'),
    h(TabsContent, { value: 'password' }, () => 'Change your password.'),
  ]);

describe('theme tabs composition', () => {
  it('forwards as, renders the own dir and flips the arrow keys', async () => {
    const { container } = render(themed(() => tabs({ as: 'section', dir: 'rtl' })));
    const root = container.querySelector('.cck-tabs');
    expect(root?.localName).toBe('section');
    expect(root?.getAttribute('dir')).toBe('rtl');
    screen.getByRole('tab', { name: 'Account' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('true');
  });

  it('renders a div and no dir attribute by default', () => {
    const { container } = render(themed(() => tabs({})));
    const root = container.querySelector('.cck-tabs');
    expect(root?.localName).toBe('div');
    expect(root?.hasAttribute('dir')).toBe(false);
  });
});

describe('theme select composition', () => {
  it('forwards the own dir to the root and the portaled list', async () => {
    const { container } = render(themed(() => h(SelectRoot as Component, { dir: 'rtl' }, () => selectParts())));
    expect(container.querySelector('.cck-select')?.getAttribute('dir')).toBe('rtl');
    await userEvent.click(screen.getByRole('combobox'));
    const list = await screen.findByRole('listbox');
    expect(list.closest('[popover]')?.getAttribute('dir')).toBe('rtl');
  });
});

describe('theme tab nav composition', () => {
  it('forwards as and lets aria-label fall through to the element', () => {
    const { container } = render(
      themed(() =>
        h(TabNavRoot as Component, { as: 'div', 'aria-label': 'Project' }, () =>
          h(TabNavLink, { href: '#a', active: true }, () => 'A'),
        ),
      ),
    );
    const root = container.querySelector('.cck-tab-nav');
    expect(root?.localName).toBe('div');
    expect(root?.getAttribute('aria-label')).toBe('Project');
  });

  it('renders a nav by default', () => {
    render(
      themed(() =>
        h(TabNavRoot as Component, { 'aria-label': 'Project' }, () =>
          h(TabNavLink, { href: '#a', active: true }, () => 'A'),
        ),
      ),
    );
    expect(screen.getByRole('navigation', { name: 'Project' }).localName).toBe('nav');
  });
});

describe('theme tabs default-value and slot props', () => {
  it('forwards default-value and stays uncontrolled when the consumer binds no model', async () => {
    const update = vi.fn();
    render(themed(() => tabs({ defaultValue: 'password', 'onUpdate:modelValue': update })));
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('true');
    await userEvent.click(screen.getByRole('tab', { name: 'Account' }));
    expect(update).toHaveBeenCalledWith('account');
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
  });

  it('ignores default-value when the model is bound with a listener', async () => {
    const update = vi.fn();
    render(themed(() => tabs({ modelValue: 'account', defaultValue: 'password', 'onUpdate:modelValue': update })));
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
    await userEvent.click(screen.getByRole('tab', { name: 'Password' }));
    expect(update).toHaveBeenCalledWith('password');
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
  });

  it('starts local state from a model prop bound without a listener', async () => {
    render(themed(() => tabs({ modelValue: 'account', defaultValue: 'password' })));
    expect(screen.getByRole('tab', { name: 'Account' }).getAttribute('aria-selected')).toBe('true');
    await userEvent.click(screen.getByRole('tab', { name: 'Password' }));
    expect(screen.getByRole('tab', { name: 'Password' }).getAttribute('aria-selected')).toBe('true');
  });

  it('passes the slot props of the root through its own default slot', async () => {
    const seen: (string | undefined)[] = [];
    render(
      themed(() =>
        h(TabsRoot as Component, null, {
          default: (slot: { modelValue: string | undefined }) => {
            seen.push(slot.modelValue);
            return [
              h(TabsList, { 'aria-label': 'x' }, () => [
                h(TabsTrigger, { value: 'a' }, () => 'A'),
                h(TabsTrigger, { value: 'b' }, () => 'B'),
              ]),
              h(TabsContent, { value: 'a' }, () => 'a'),
              h(TabsContent, { value: 'b' }, () => 'b'),
            ];
          },
        }),
      ),
    );
    await nextTick();
    expect(seen.at(-1)).toBe('a');
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(seen.at(-1)).toBe('b');
  });
});

describe('theme select default-value, default-open and slot props', () => {
  const select = (props: Record<string, unknown>, options?: (slot: unknown) => VNode[]): VNode =>
    h(SelectRoot as Component, props, { default: options ?? (() => selectParts()) });

  it('forwards default-value and stays uncontrolled when the consumer binds no model', async () => {
    const update = vi.fn();
    render(themed(() => select({ defaultValue: 'Pizza', 'onUpdate:modelValue': update })));
    expect(screen.getByRole('combobox').textContent).toContain('Pizza');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(update).toHaveBeenCalledWith('Cake');
    await waitFor(() => {
      expect(screen.getByRole('combobox').textContent).toContain('Cake');
    });
  });

  it('forwards default-open', async () => {
    render(themed(() => select({ defaultOpen: true })));
    expect(await screen.findByRole('listbox')).toBeTruthy();
  });

  it('keeps v-model controlled and ignores default-value', async () => {
    const update = vi.fn();
    render(themed(() => select({ modelValue: 'Cake', defaultValue: 'Pizza', 'onUpdate:modelValue': update })));
    expect(screen.getByRole('combobox').textContent).toContain('Cake');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Pizza' }));
    expect(update).toHaveBeenCalledWith('Pizza');
    expect(screen.getByRole('combobox').textContent).toContain('Cake');
  });

  it('passes the slot props of the root through its own default slot', async () => {
    const seen: { modelValue: unknown; open: boolean }[] = [];
    render(
      themed(() =>
        select({ defaultValue: 'Pizza' }, (slot) => {
          seen.push(slot as { modelValue: unknown; open: boolean });
          return selectParts({ items: () => [item('Cake')] });
        }),
      ),
    );
    await userEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(seen.at(-1)).toEqual({ modelValue: 'Pizza', open: true });
    });
  });
});

describe('theme control default values', () => {
  it('Checkbox: forwards defaultChecked and stays uncontrolled beside a listener', async () => {
    const update = vi.fn();
    render(themed(() => h(Checkbox, { defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' })));
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
    await userEvent.click(screen.getByRole<HTMLInputElement>('checkbox'));
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
    expect(update).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('Checkbox: ignores defaultChecked when the model is bound with a listener', async () => {
    const update = vi.fn();
    render(
      themed(() =>
        h(Checkbox, { modelValue: false, defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }),
      ),
    );
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
    await userEvent.click(screen.getByRole<HTMLInputElement>('checkbox'));
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
  });

  it('Checkbox: starts local state from a model bound without a listener', async () => {
    render(themed(() => h(Checkbox, { modelValue: true, defaultChecked: false, 'aria-label': 'A' })));
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
    await userEvent.click(screen.getByRole<HTMLInputElement>('checkbox'));
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
  });

  it('Switch: forwards defaultChecked and stays uncontrolled beside a listener', async () => {
    const update = vi.fn();
    render(themed(() => h(Switch, { defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' })));
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(true);
    await userEvent.click(screen.getByRole<HTMLInputElement>('switch'));
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(false);
    expect(update).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('Switch: ignores defaultChecked when the model is bound with a listener', async () => {
    const update = vi.fn();
    render(
      themed(() =>
        h(Switch, { modelValue: false, defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }),
      ),
    );
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(false);
    await userEvent.click(screen.getByRole<HTMLInputElement>('switch'));
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(false);
  });

  it('Switch: starts local state from a model bound without a listener', async () => {
    render(themed(() => h(Switch, { modelValue: true, defaultChecked: false, 'aria-label': 'A' })));
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(true);
    await userEvent.click(screen.getByRole<HTMLInputElement>('switch'));
    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(false);
  });

  it('Radio: forwards defaultChecked and stays uncontrolled beside a listener', async () => {
    const update = vi.fn();
    render(
      themed(() => [
        h(Radio, { name: 'plan', defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'Free' }),
        h(Radio, { name: 'plan', 'aria-label': 'Pro' }),
      ]),
    );
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Free' }).checked).toBe(true);
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Free' }).checked).toBe(false);
    expect(update).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('Radio: ignores defaultChecked when the model is bound with a listener', async () => {
    const update = vi.fn();
    render(
      themed(() =>
        h(Radio, { modelValue: false, defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }),
      ),
    );
    expect(screen.getByRole<HTMLInputElement>('radio').checked).toBe(false);
    await userEvent.click(screen.getByRole<HTMLInputElement>('radio'));
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.getByRole<HTMLInputElement>('radio').checked).toBe(false);
  });

  it('Radio: starts local state from a model bound without a listener', async () => {
    render(
      themed(() => [
        h(Radio, { name: 'plan', modelValue: true, defaultChecked: false, 'aria-label': 'Free' }),
        h(Radio, { name: 'plan', 'aria-label': 'Pro' }),
      ]),
    );
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Free' }).checked).toBe(true);
    await userEvent.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Free' }).checked).toBe(false);
  });

  it('Textarea: forwards defaultValue and stays uncontrolled beside a listener', async () => {
    const update = vi.fn();
    render(themed(() => h(Textarea, { defaultValue: 'Ada', 'onUpdate:modelValue': update })));
    expect(screen.getByRole<HTMLTextAreaElement>('textbox').value).toBe('Ada');
    await userEvent.type(screen.getByRole<HTMLTextAreaElement>('textbox'), 'x');
    expect(screen.getByRole<HTMLTextAreaElement>('textbox').value).toBe('Adax');
    expect(update).toHaveBeenCalledExactlyOnceWith('Adax');
  });

  it('Textarea: ignores defaultValue when the model is bound with a listener', async () => {
    const update = vi.fn();
    render(themed(() => h(Textarea, { modelValue: 'Bob', defaultValue: 'Ada', 'onUpdate:modelValue': update })));
    await userEvent.type(screen.getByRole<HTMLTextAreaElement>('textbox'), 'x');
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith('Bobx');
    expect(screen.getByRole<HTMLTextAreaElement>('textbox').value).toBe('Bob');
  });

  it('Textarea: starts local state from a model bound without a listener', async () => {
    render(themed(() => h(Textarea, { modelValue: 'Bob', defaultValue: 'Ada' })));
    await userEvent.type(screen.getByRole<HTMLTextAreaElement>('textbox'), 'x');
    expect(screen.getByRole<HTMLTextAreaElement>('textbox').value).toBe('Bobx');
  });
});
