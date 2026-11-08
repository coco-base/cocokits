// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import { createSSRApp, defineComponent, h, nextTick, ref, type Ref, type VNode } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { Hint } from '../../hint';
import { Input } from '../../input';
import { Label } from '../../label';
import { FormField } from '../index';
import { mountView, view } from '../../internal/tests/mount-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The development warning, word for word the same in both frameworks. */
const WARNING =
  'CocoKits: a FormField lists only the Hint and FieldError parts and the plain text put directly in its hint or ' +
  'error zone. Other content there, such as an element, a wrapper or a component, is not listed and does not ' +
  'describe the control.';

const describedBy = (): string | null => screen.getByRole('textbox').getAttribute('aria-describedby');

interface Zones {
  hint?: () => unknown;
  error?: () => unknown;
}

function field(zones: Zones, extra: Record<string, unknown> = {}): VNode {
  return h(
    FormField,
    { id: 'f', ...extra },
    {
      label: () => h(Label, null, () => 'Name'),
      default: () => h(Input),
      ...zones,
    },
  );
}

describe('FormField hint and error parts', () => {
  it('gives no id to a plain element in a zone and does not list it', async () => {
    mountView(() =>
      field({ hint: () => [h('span', { 'data-testid': 'plain' }, 'Note'), h(Hint, null, () => 'Help')] }),
    );
    await nextTick();
    expect(screen.getByTestId('plain').hasAttribute('id')).toBe(false);
    expect(describedBy()).toBe('f-hint-1');
  });

  it('does not read into a wrapper, gives it no id and warns in development', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      field({
        hint: () => h('div', { 'data-testid': 'wrapper' }, [h(Hint, null, () => 'One'), h(Hint, null, () => 'Two')]),
      }),
    );
    await nextTick();
    expect(screen.getByTestId('wrapper').hasAttribute('id')).toBe(false);
    expect(document.querySelectorAll('.cck-hint[id]')).toHaveLength(0);
    expect(describedBy()).toBeNull();
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('warns once in development for a plain element, also across renders', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const count = ref(0);
    mountView(() => field({ hint: () => [h('span', `Note ${String(count.value)}`), h(Hint, null, () => 'Help')] }));
    await nextTick();
    count.value += 1;
    await settle();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('gives no id to a custom component that renders a Hint itself, does not list it and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const MyHint = defineComponent({ setup: () => () => h(Hint, null, () => 'Mine') });
    mountView(() => field({ hint: () => h(MyHint) }));
    await nextTick();
    expect(screen.getByText('Mine').hasAttribute('id')).toBe(false);
    expect(describedBy()).toBeNull();
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('gives no id to a FieldError in the hint zone or a Hint in the error zone, lists neither and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      field({
        hint: () => h(FieldError, { force: true }, () => 'Wrong zone'),
        error: () => h(Hint, null, () => 'Also'),
      }),
    );
    await nextTick();
    expect(screen.getByText('Wrong zone').hasAttribute('id')).toBe(false);
    expect(screen.getByText('Also').hasAttribute('id')).toBe(false);
    expect(describedBy()).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('does not warn for Hints, FieldErrors and plain text', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() =>
      field({ hint: () => ['Help', h(Hint, null, () => 'More')], error: () => h(FieldError, null, () => 'Wrong') }),
    );
    await settle();
    expect(warn).not.toHaveBeenCalled();
  });

  it('renders plain hint text in a Hint whose id is listed', async () => {
    mountView(() => field({ hint: () => 'Help' }));
    await nextTick();
    const hint = screen.getByText('Help');
    expect(hint.className).toBe('cck-hint');
    expect(hint.id).toBe('f-hint-1');
    expect(screen.getByRole('textbox', { description: 'Help' })).toBeDefined();
  });

  it('renders plain error text in a FieldError that always shows, as the plain text did before', async () => {
    mountView(() => field({ hint: () => 'Help', error: () => 'Enter a name.' }));
    await nextTick();
    const error = screen.getByText('Enter a name.');
    expect(error.className).toBe('cck-field-error');
    expect(error.id).toBe('f-error-1');
    expect(describedBy()).toBe('f-hint-1 f-error-1');
  });

  it('lists a Hint and a FieldError added before static ones in document order, and drops removed ones', async () => {
    const extra = ref(false);
    mountView(() =>
      field({
        hint: () => [
          extra.value ? h(Hint, { id: 'new-hint' }, () => 'New') : null,
          h(Hint, { id: 'old-hint' }, () => 'Old'),
        ],
        error: () => [
          extra.value ? h(FieldError, { id: 'new-error' }, () => 'New') : null,
          h(FieldError, { id: 'old-error' }, () => 'Old'),
        ],
      }),
    );
    await nextTick();
    expect(describedBy()).toBe('old-hint old-error');
    extra.value = true;
    await settle();
    expect(describedBy()).toBe('new-hint old-hint new-error old-error');
    extra.value = false;
    await settle();
    expect(describedBy()).toBe('old-hint old-error');
  });

  it('numbers generated ids in document order after a part is added before the others', async () => {
    const extra = ref(false);
    mountView(() =>
      field({ hint: () => [extra.value ? h(Hint, null, () => 'New') : null, h(Hint, null, () => 'Old')] }),
    );
    await nextTick();
    expect(screen.getByText('Old').id).toBe('f-hint-1');
    extra.value = true;
    await settle();
    expect(screen.getByText('New').id).toBe('f-hint-1');
    expect(screen.getByText('Old').id).toBe('f-hint-2');
    expect(describedBy()).toBe('f-hint-1 f-hint-2');
  });

  it('gives the server HTML the same description as the client', async () => {
    const zones: Zones = {
      hint: () => ['Help', h('span', 'Note'), h(Hint, null, () => 'More')],
      error: () => 'Enter a name.',
    };
    const html = await renderToString(createSSRApp(view(() => field(zones))));
    const server = /aria-describedby="([^"]*)"/.exec(html)?.[1];
    mountView(() => field(zones));
    await nextTick();
    expect(server).toBe('f-hint-1 f-hint-2 f-error-1');
    expect(describedBy()).toBe(server);
  });

  it('writes no state while it renders: the zones render once when it mounts', async () => {
    const hint = vi.fn(() => h(Hint, null, () => 'Help'));
    // A plain input reports no state to the field, so nothing else renders the zones again.
    mountView(() => h(FormField, { id: 'f' }, { default: () => h('input', { 'aria-describedby': 'f-hint-1' }), hint }));
    await settle();
    expect(document.querySelector('.cck-hint')?.id).toBe('f-hint-1');
    expect(hint).toHaveBeenCalledTimes(1);
  });
});

describe('FormField parts in a template-like parent', () => {
  it('keeps the ids when the parent re-renders for another reason', async () => {
    const count: Ref<number> = ref(0);
    const Parent = defineComponent({
      setup: () => () => [h('p', String(count.value)), field({ hint: () => h(Hint, null, () => 'Help') })],
    });
    mountView(() => h(Parent));
    await nextTick();
    count.value += 1;
    await settle();
    expect(describedBy()).toBe('f-hint-1');
  });
});

/** Waits for the render and the updates it schedules. */
async function settle(): Promise<void> {
  await nextTick();
  await nextTick();
}
