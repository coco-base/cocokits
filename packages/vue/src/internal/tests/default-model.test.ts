// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/vue';
import { h, nextTick, ref, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selectAnatomy } from '@cocokits/machines/select';
import { DialogClose, DialogContent, DialogRoot, DialogTrigger } from '../../dialog';
import { stubOverlayBrowser as stubDialogBrowser } from '../../dialog/tests/fixtures';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { settle, stubOverlayBrowser as stubPopoverBrowser } from '../../popover/tests/fixtures';
import { item, selectRoot, stubOverlayBrowser as stubSelectBrowser } from '../../select/tests/fixtures';
import { TabsList, TabsContent, TabsRoot, TabsTrigger } from '../../tabs';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../../tooltip';
import { mountView } from './mount-helpers';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** An overlay root with a trigger, and a content that holds the `Close` of the dialog or popover. */
interface OverlayCase {
  readonly name: string;
  readonly stub: () => void;
  readonly view: (rootProps: Record<string, unknown>) => VNode;
  readonly isOpen: () => boolean;
  readonly dismiss: () => Promise<void>;
}
const overlays: readonly OverlayCase[] = [
  {
    name: 'DialogRoot',
    stub: stubDialogBrowser,
    view: (rootProps) =>
      h(DialogRoot as Component, rootProps, () => [
        h(DialogTrigger as Component, null, () => 'Open'),
        h(DialogContent as Component, { 'aria-label': 'Panel' }, () =>
          h(DialogClose as Component, null, () => 'Close'),
        ),
      ]),
    isOpen: () => document.querySelector('dialog[open]') !== null,
    dismiss: async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    },
  },
  {
    name: 'PopoverRoot',
    stub: stubPopoverBrowser,
    view: (rootProps) =>
      h(PopoverRoot as Component, rootProps, () => [
        h(PopoverTrigger as Component, null, () => 'Open'),
        h(PopoverContent as Component, { 'aria-label': 'Panel' }, () => 'Body'),
      ]),
    isOpen: () => screen.queryByRole('dialog') !== null,
    dismiss: async () => {
      await userEvent.keyboard('{Escape}');
    },
  },
  {
    name: 'TooltipRoot',
    stub: stubPopoverBrowser,
    view: (rootProps) =>
      h(TooltipRoot as Component, rootProps, () => [
        h(TooltipTrigger as Component, null, () => 'Open'),
        h(TooltipContent as Component, null, () => 'Tip'),
      ]),
    isOpen: () => document.querySelector('.cck-tooltip__content') !== null,
    dismiss: async () => {
      await userEvent.keyboard('{Escape}');
    },
  },
];

describe.each(overlays)('$name default-open', (overlay) => {
  beforeEach(overlay.stub);

  it('starts open and uncontrolled, emits update:open on a change and closes', async () => {
    const update = vi.fn();
    mountView(() => [overlay.view({ defaultOpen: true, 'onUpdate:open': update })]);
    await settle();
    expect(overlay.isOpen()).toBe(true);
    expect(update).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Open' }).focus();
    await overlay.dismiss();
    await settle();
    expect(update).toHaveBeenCalledWith(false);
    expect(overlay.isOpen()).toBe(false);
  });

  it('starts closed without it, and reads it once: a later change is ignored', async () => {
    const start = ref(true);
    mountView(() => [overlay.view({ defaultOpen: start.value })]);
    await settle();
    expect(overlay.isOpen()).toBe(true);
    start.value = false;
    await nextTick();
    await settle();
    expect(overlay.isOpen()).toBe(true);
  });

  it('is not reset by a render of the parent', async () => {
    const renders = ref(0);
    mountView(() => [h('p', renders.value), overlay.view({ defaultOpen: true })]);
    await settle();
    screen.getByRole('button', { name: 'Open' }).focus();
    await overlay.dismiss();
    await settle();
    expect(overlay.isOpen()).toBe(false);
    renders.value += 1;
    await nextTick();
    await settle();
    expect(overlay.isOpen()).toBe(false);
  });

  it('ignores it when open is bound with a listener, and the UI follows the parent', async () => {
    const update = vi.fn();
    mountView(() => [overlay.view({ open: false, defaultOpen: true, 'onUpdate:open': update })]);
    await settle();
    expect(overlay.isOpen()).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await settle();
    if (overlay.name !== 'TooltipRoot') {
      expect(update).toHaveBeenCalledWith(true);
      expect(overlay.isOpen()).toBe(false);
    }
  });

  it('with open bound without a listener: starts from the prop, applies a user change, takes a new prop value', async () => {
    const open = ref(true);
    mountView(() => [overlay.view({ open: open.value, defaultOpen: false })]);
    await settle();
    expect(overlay.isOpen()).toBe(true);
    screen.getByRole('button', { name: 'Open' }).focus();
    await overlay.dismiss();
    await settle();
    expect(overlay.isOpen()).toBe(false);
    open.value = false;
    await nextTick();
    open.value = true;
    await nextTick();
    await settle();
    expect(overlay.isOpen()).toBe(true);
  });
});

describe('TabsRoot default-value', () => {
  const tabs = (rootProps: Record<string, unknown>): VNode =>
    h(TabsRoot, rootProps, () => [
      h(TabsList, { 'aria-label': 'Account' }, () => [
        h(TabsTrigger, { value: 'account' }, () => 'Account'),
        h(TabsTrigger, { value: 'password' }, () => 'Password'),
        h(TabsTrigger, { value: 'notifications' }, () => 'Notifications'),
      ]),
      h(TabsContent, { value: 'account' }, () => 'a'),
      h(TabsContent, { value: 'password' }, () => 'p'),
      h(TabsContent, { value: 'notifications' }, () => 'n'),
    ]);
  const selected = (): string | null =>
    screen.getAllByRole('tab').find((tab) => tab.getAttribute('aria-selected') === 'true')?.textContent ?? null;

  it('selects the tab at the start, uncontrolled, and emits update:modelValue on a change', async () => {
    const update = vi.fn();
    mountView(() => [tabs({ defaultValue: 'password', 'onUpdate:modelValue': update })]);
    await nextTick();
    expect(selected()).toBe('Password');
    expect(update).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(update).toHaveBeenCalledWith('notifications');
    expect(selected()).toBe('Notifications');
  });

  it('reads it once and survives a render of the parent', async () => {
    const start = ref('password');
    const renders = ref(0);
    mountView(() => [h('p', renders.value), tabs({ defaultValue: start.value })]);
    await nextTick();
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    start.value = 'account';
    renders.value += 1;
    await nextTick();
    expect(selected()).toBe('Notifications');
  });

  it('ignores it when modelValue is bound with a listener: a parent that refuses keeps the UI', async () => {
    const update = vi.fn();
    mountView(() => [tabs({ modelValue: 'account', defaultValue: 'password', 'onUpdate:modelValue': update })]);
    await nextTick();
    expect(selected()).toBe('Account');
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(update).toHaveBeenCalledWith('notifications');
    expect(selected()).toBe('Account');
  });

  it('with modelValue bound without a listener: starts from the prop, applies a user change, takes a new prop value', async () => {
    const value = ref('account');
    mountView(() => [tabs({ modelValue: value.value, defaultValue: 'password' })]);
    await nextTick();
    expect(selected()).toBe('Account');
    await userEvent.click(screen.getByRole('tab', { name: 'Notifications' }));
    expect(selected()).toBe('Notifications');
    value.value = 'password';
    await nextTick();
    expect(selected()).toBe('Password');
  });
});

describe('SelectRoot default-open and default-value', () => {
  beforeEach(stubSelectBrowser);
  const { classes } = selectAnatomy;
  const select = (rootProps: Record<string, unknown>): VNode =>
    selectRoot({ placeholder: 'Choose', ...rootProps }, { items: () => [item('Cake'), item('Pizza'), item('Burger')] });
  const valueText = (): string | undefined =>
    screen.getByRole('combobox').querySelector(`.${classes.value}`)?.textContent.trim();

  it('starts with the value, uncontrolled, and emits update:modelValue on a change', async () => {
    const update = vi.fn();
    mountView(() => [select({ defaultValue: 'Pizza', 'onUpdate:modelValue': update })]);
    expect(valueText()).toBe('Pizza');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Cake' }));
    expect(update).toHaveBeenCalledWith('Cake');
    await waitFor(() => {
      expect(valueText()).toBe('Cake');
    });
  });

  it('starts open with default-open', async () => {
    const update = vi.fn();
    mountView(() => [select({ defaultOpen: true, 'onUpdate:open': update })]);
    expect(await screen.findByRole('listbox')).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(false);
    });
  });

  it('keeps the choice when the parent renders again with an array literal', async () => {
    const renders = ref(0);
    mountView(() => [h('p', renders.value), select({ multiple: true, defaultValue: ['Cake'] })]);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Pizza' }));
    renders.value += 1;
    await nextTick();
    await settle();
    expect(valueText()).toContain('Pizza');
  });

  it('ignores default-value when model-value is bound with a listener', async () => {
    const update = vi.fn();
    mountView(() => [select({ modelValue: 'Cake', defaultValue: 'Pizza', 'onUpdate:modelValue': update })]);
    expect(valueText()).toBe('Cake');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Burger' }));
    expect(update).toHaveBeenCalledWith('Burger');
    expect(valueText()).toBe('Cake');
  });

  it('restores default-value on a form reset, and emits update:modelValue', async () => {
    const update = vi.fn();
    const { container } = mountView(() => [
      h('form', null, [select({ name: 'dish', defaultValue: 'Pizza', 'onUpdate:modelValue': update })]),
    ]);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Cake' }));
    await waitFor(() => {
      expect(valueText()).toBe('Cake');
    });
    update.mockClear();
    const form = container.querySelector('form');
    if (!form) throw new Error('no form');
    form.reset();
    await nextTick();
    await fireEvent.reset(form);
    await waitFor(() => {
      expect(valueText()).toBe('Pizza');
    });
    expect(update).toHaveBeenCalledWith('Pizza');
  });

  it('clears on a form reset when there is no default-value', async () => {
    const { container } = mountView(() => [h('form', null, [select({ name: 'dish' })])]);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Cake' }));
    await waitFor(() => {
      expect(valueText()).toBe('Cake');
    });
    container.querySelector('form')?.reset();
    await waitFor(() => {
      expect(screen.getByRole('combobox').querySelector(`.${classes.placeholder}`)).not.toBeNull();
    });
  });
});
