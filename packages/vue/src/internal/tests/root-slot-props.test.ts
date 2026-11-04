// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen, waitFor } from '@testing-library/vue';
import { h, nextTick, type Component, type VNode } from 'vue';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { DialogContent, DialogRoot, DialogTrigger } from '../../dialog';
import { stubOverlayBrowser as stubDialogBrowser } from '../../dialog/tests/fixtures';
import { PopoverContent, PopoverRoot, PopoverTrigger } from '../../popover';
import { settle, stubOverlayBrowser as stubPopoverBrowser } from '../../popover/tests/fixtures';
import { SelectRoot } from '../../select';
import { item, selectParts, stubOverlayBrowser as stubSelectBrowser } from '../../select/tests/fixtures';
import { TabsList, TabsContent, TabsRoot, TabsTrigger } from '../../tabs';
import { TooltipContent, TooltipRoot, TooltipTrigger } from '../../tooltip';
import { mountView } from './mount-helpers';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

/** The scope the default slot of a component declares. */
type ScopeOf<C extends abstract new (...args: never) => { $slots: { default?: (props: never) => unknown } }> =
  Parameters<NonNullable<InstanceType<C>['$slots']['default']>>[0];

/** The scope the default slot of the generic TabsRoot declares, for a string value. */
type TabsScope = Parameters<
  NonNullable<NonNullable<ReturnType<typeof TabsRoot<string>>['__ctx']>['slots']['default']>
>[0];

describe('the types of the root slot props', () => {
  it('are the fields of Reka UI', () => {
    expectTypeOf<ScopeOf<typeof DialogRoot>>().toEqualTypeOf<{ open: boolean; close: () => void }>();
    expectTypeOf<ScopeOf<typeof PopoverRoot>>().toEqualTypeOf<{ open: boolean; close: () => void }>();
    expectTypeOf<ScopeOf<typeof TooltipRoot>>().toEqualTypeOf<{ open: boolean }>();
    expectTypeOf<TabsScope>().toEqualTypeOf<{ modelValue: string | undefined }>();
  });
});

describe.each([
  ['DialogRoot', DialogRoot, DialogTrigger, DialogContent, stubDialogBrowser],
  ['PopoverRoot', PopoverRoot, PopoverTrigger, PopoverContent, stubPopoverBrowser],
] as const)('%s slot props', (_name, Root, Trigger, Content, stub) => {
  beforeEach(stub);

  it('gives open and a close() that closes and emits update:open with false', async () => {
    const update = vi.fn();
    const seen: boolean[] = [];
    mountView(() => [
      h(
        Root as Component,
        { open: true, 'onUpdate:open': update },
        {
          default: (slot: { open: boolean; close: () => void }) => {
            seen.push(slot.open);
            return [
              h(Trigger as Component, null, () => 'Open'),
              h(Content as Component, { 'aria-label': 'Panel' }, () =>
                h('button', { onClick: slot.close, id: 'closer' }, 'Done'),
              ),
            ];
          },
        },
      ),
    ]);
    await settle();
    expect(seen[0]).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(update).toHaveBeenCalledWith(false);
  });

  it('gives open: false while closed, and the new state after an uncontrolled change', async () => {
    const seen: boolean[] = [];
    mountView(() => [
      h(Root as Component, null, {
        default: (slot: { open: boolean }) => {
          seen.push(slot.open);
          return [
            h(Trigger as Component, null, () => 'Open'),
            h(Content as Component, { 'aria-label': 'Panel' }, () => 'Body'),
          ];
        },
      }),
    ]);
    await settle();
    expect(seen.at(-1)).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await settle();
    expect(seen.at(-1)).toBe(true);
  });
});

describe('TooltipRoot slot props', () => {
  beforeEach(stubPopoverBrowser);

  it('gives open', async () => {
    const seen: boolean[] = [];
    mountView(() => [
      h(
        TooltipRoot as Component,
        { defaultOpen: true },
        {
          default: (slot: { open: boolean }) => {
            seen.push(slot.open);
            return [h(TooltipTrigger, null, () => 'Open'), h(TooltipContent, null, () => 'Tip')];
          },
        },
      ),
    ]);
    await settle();
    expect(seen.at(-1)).toBe(true);
  });
});

describe('TabsRoot slot props', () => {
  it('gives the selected tab as modelValue', async () => {
    const seen: (string | undefined)[] = [];
    mountView(() => [
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
    ]);
    await nextTick();
    expect(seen.at(-1)).toBe('a');
    await userEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(seen.at(-1)).toBe('b');
  });
});

describe('SelectRoot slot props', () => {
  beforeEach(stubSelectBrowser);

  it('gives modelValue and open to the parts', async () => {
    const seen: { modelValue: unknown; open: boolean }[] = [];
    const options = (slot: { modelValue: unknown; open: boolean }): VNode[] => {
      seen.push({ modelValue: slot.modelValue, open: slot.open });
      return selectParts({}, { items: () => [item('Cake'), item('Pizza')] });
    };
    mountView(() => [h(SelectRoot as Component, { defaultValue: 'Pizza' }, { default: options })]);
    await userEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      expect(seen.at(-1)).toEqual({ modelValue: 'Pizza', open: true });
    });
    await userEvent.click(await screen.findByRole('option', { name: 'Cake' }));
    await waitFor(() => {
      expect(seen.at(-1)?.modelValue).toBe('Cake');
    });
  });
});
