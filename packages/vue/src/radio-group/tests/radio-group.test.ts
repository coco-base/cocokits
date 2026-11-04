// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent, h, nextTick, ref } from 'vue';
import { provideDirection } from '@cocokits/vue-core';
import { radioGroupMeta } from '@cocokits/machines/radio-group';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio } from '../../radio';
import { must, nextTask } from '../../internal/tests/choice-helpers';
import { RadioGroup } from '../index';
import { groupView, mountView } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });
const group = (): HTMLElement => screen.getByRole('radiogroup');
const checkedLabels = (): string[] =>
  screen.getAllByRole<HTMLInputElement>('radio').flatMap((input) => (input.checked ? [input.value] : []));
const tabStops = (): string[] =>
  screen.getAllByRole<HTMLInputElement>('radio').flatMap((input) => (input.tabIndex === 0 ? [input.value] : []));

describe('RadioGroup anatomy and root', () => {
  it('renders the default element of the meta', () => {
    mountView(groupView());
    expect(group().localName).toBe(radioGroupMeta.defaultElements?.root);
  });

  it('renders the root contract and only the declared data attributes', () => {
    mountView(groupView({ group: { required: true, disabled: true, orientation: 'vertical' } }));
    const root = group();
    expect(root.tagName).toBe('DIV');
    expect(root.className).toBe('cck-radio-group');
    expect(root.getAttribute('aria-labelledby')).toBe('plan-label');
    expect(root.getAttribute('aria-required')).toBe('true');
    expect(root.getAttribute('aria-disabled')).toBe('true');
    expect(root.getAttribute('aria-orientation')).toBe('vertical');
    const declared = [...radioGroupMeta.dataAttrs.root].sort();
    const rendered = root.getAttributeNames().filter((name) => name.startsWith('data-'));
    expect(rendered.sort()).toEqual(declared);
    expect(root.hasAttribute('name')).toBe(false);
    expect(root.hasAttribute('form')).toBe(false);
  });

  it('renders no state attribute when nothing is set, and the own dir only', () => {
    mountView(groupView({ group: { dir: 'rtl' } }));
    const root = group();
    expect(root.getAttributeNames().filter((name) => name.startsWith('data-') || name.startsWith('aria-'))).toEqual([
      'aria-labelledby',
    ]);
    expect(root.getAttribute('dir')).toBe('rtl');
  });

  it('renders the element of as', () => {
    mountView(groupView({ group: { as: 'section' } }));
    expect(group().tagName).toBe('SECTION');
  });

  it('merges onto its child with asChild', () => {
    mountView(() =>
      h(RadioGroup, { asChild: true, 'aria-label': 'Plan' }, () =>
        h(
          'fieldset',
          { class: 'mine' },
          h(Radio, { value: 'free' }, () => 'Free'),
        ),
      ),
    );
    const root = group();
    expect(root.tagName).toBe('FIELDSET');
    expect(root.classList.contains('cck-radio-group')).toBe(true);
    expect(root.classList.contains('mine')).toBe(true);
  });
});

describe('RadioGroup value', () => {
  it('checks the radio of defaultValue and an unmatched value checks none', () => {
    mountView(groupView({ group: { defaultValue: 'pro' } }));
    expect(checkedLabels()).toEqual(['pro']);
    cleanup();
    mountView(groupView({ group: { modelValue: 'enterprise', 'onUpdate:modelValue': () => undefined } }));
    expect(checkedLabels()).toEqual([]);
  });

  it('emits update:modelValue once with the value on a user check and keeps its own state when unbound', async () => {
    const updates: (string | null)[] = [];
    mountView(
      groupView({ group: { defaultValue: 'free', 'onUpdate:modelValue': (v: string | null) => updates.push(v) } }),
    );
    await userEvent.click(radio('Pro'));
    expect(updates).toEqual(['pro']);
    expect(checkedLabels()).toEqual(['pro']);
    await userEvent.click(radio('Pro'));
    expect(updates).toEqual(['pro']);
  });

  it('emits nothing for a parent write and follows it', async () => {
    const selected = ref<string | null>('free');
    const updates: unknown[] = [];
    mountView(() =>
      h(
        RadioGroup,
        {
          modelValue: selected.value,
          'onUpdate:modelValue': (v: string | null) => {
            updates.push(v);
            selected.value = v;
          },
        },
        () => ['free', 'pro'].map((value) => h(Radio, { key: value, value }, () => value)),
      ),
    );
    selected.value = 'pro';
    await nextTick();
    expect(checkedLabels()).toEqual(['pro']);
    expect(updates).toEqual([]);
    selected.value = null;
    await nextTick();
    expect(checkedLabels()).toEqual([]);
    expect(updates).toEqual([]);
  });

  it('puts a rejected change back: the inputs show the value of the parent', async () => {
    mountView(groupView({ group: { modelValue: 'free', 'onUpdate:modelValue': () => undefined } }));
    await userEvent.click(radio('Pro'));
    await nextTask();
    expect(checkedLabels()).toEqual(['free']);
  });

  it('emits nothing from the Radio inside a group', async () => {
    const own = vi.fn();
    mountView(() =>
      h(RadioGroup, { defaultValue: 'free' }, () => [
        h(Radio, { value: 'free', onCheckedChange: own, 'onUpdate:modelValue': own }, () => 'Free'),
        h(Radio, { value: 'pro', onCheckedChange: own, 'onUpdate:modelValue': own }, () => 'Pro'),
      ]),
    );
    await userEvent.click(radio('Pro'));
    expect(own).not.toHaveBeenCalled();
  });

  it('checks by a click on the label and ignores the Radio own v-model and name', async () => {
    mountView(() =>
      h(RadioGroup, { name: 'plan', defaultValue: 'free' }, () => [
        h(Radio, { value: 'free', modelValue: false, name: 'other' }, () => 'Free'),
        h(Radio, { value: 'pro', modelValue: true }, () => 'Pro'),
      ]),
    );
    expect(checkedLabels()).toEqual(['free']);
    expect(radio('Free').name).toBe('plan');
    await userEvent.click(screen.getByText('Pro'));
    expect(checkedLabels()).toEqual(['pro']);
  });
});

describe('RadioGroup keys', () => {
  it('moves focus and check with the arrows, wraps with loop, and leaves Home and End alone', async () => {
    const updates: unknown[] = [];
    mountView(
      groupView({
        group: { defaultValue: 'free', 'onUpdate:modelValue': (v: unknown) => updates.push(v) },
        disabled: ['pro'],
      }),
    );
    await nextTick();
    radio('Free').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radio('Team'));
    expect(checkedLabels()).toEqual(['team']);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radio('Free'));
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(radio('Team'));
    expect(updates).toEqual(['team', 'free', 'team']);
    const end = new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true });
    radio('Team').dispatchEvent(end);
    expect(end.defaultPrevented).toBe(false);
  });

  it('stops at the end with loop false and blocks the other axis', async () => {
    mountView(groupView({ group: { defaultValue: 'team', loop: false, orientation: 'vertical' } }));
    await nextTick();
    radio('Team').focus();
    const down = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    radio('Team').dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(checkedLabels()).toEqual(['team']);
    const right = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    radio('Team').dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(radio('Team'));
    await userEvent.keyboard('{ArrowUp}');
    expect(checkedLabels()).toEqual(['pro']);
  });

  it('swaps Left and Right in rtl, also from an inherited direction', async () => {
    mountView(() =>
      h(
        defineComponent({
          setup() {
            provideDirection('rtl');
            return () =>
              h(RadioGroup, { defaultValue: 'free', orientation: 'horizontal' }, () =>
                ['free', 'pro'].map((value) => h(Radio, { key: value, value }, () => value)),
              );
          },
        }),
      ),
    );
    await nextTick();
    radio('free').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(checkedLabels()).toEqual(['pro']);
  });

  it('leaves Ctrl+Arrow and a prevented key to the browser, and leaves them alone', async () => {
    mountView(groupView({ group: { defaultValue: 'free' } }));
    await nextTick();
    radio('Free').focus();
    const ctrl = new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true, bubbles: true, cancelable: true });
    radio('Free').dispatchEvent(ctrl);
    expect(ctrl.defaultPrevented).toBe(false);
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('after');
  });

  it('Space in the group selects the focused radio and emits the group change once', async () => {
    const updates: unknown[] = [];
    mountView(groupView({ group: { defaultValue: 'free', 'onUpdate:modelValue': (v: unknown) => updates.push(v) } }));
    await nextTick();
    radio('Pro').focus();
    await userEvent.keyboard(' ');
    expect(checkedLabels()).toEqual(['pro']);
    expect(updates).toEqual(['pro']);
  });

  it('ignores a key that is not on a radio input', async () => {
    mountView(groupView({ group: { defaultValue: 'free' } }));
    await nextTick();
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    group().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(checkedLabels()).toEqual(['free']);
  });
});

describe('RadioGroup tab stop', () => {
  it('has no tabindex before mount semantics, then one tab stop on the checked radio', async () => {
    mountView(groupView({ group: { defaultValue: 'pro' } }));
    await nextTick();
    expect(tabStops()).toEqual(['pro']);
    expect(radio('Free').getAttribute('tabindex')).toBe('-1');
  });

  it('falls on the first enabled radio when none is checked, and follows disabling', async () => {
    const lock = ref(true);
    mountView(() =>
      h(RadioGroup, null, () => [
        h(Radio, { value: 'free', disabled: lock.value }, () => 'Free'),
        h(Radio, { value: 'pro' }, () => 'Pro'),
      ]),
    );
    await nextTick();
    expect(tabStops()).toEqual(['pro']);
    lock.value = false;
    await nextTick();
    await nextTick();
    expect(tabStops()).toEqual(['free']);
  });

  it('enters on Tab at the checked radio and leaves on the next Tab', async () => {
    mountView(groupView({ group: { defaultValue: 'pro' } }));
    await nextTick();
    screen.getByText('before').focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(radio('Pro'));
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('after');
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(radio('Pro'));
  });

  it('revalidates when radios are added, reordered and removed', async () => {
    const values = ref(['free', 'pro']);
    mountView(() =>
      h(RadioGroup, null, () => values.value.map((value) => h(Radio, { key: value, value }, () => value))),
    );
    await nextTick();
    expect(tabStops()).toEqual(['free']);
    values.value = ['team', 'free', 'pro'];
    await nextTick();
    await nextTick();
    expect(tabStops()).toEqual(['team']);
    values.value = ['pro', 'free'];
    await nextTick();
    await nextTick();
    expect(tabStops()).toEqual(['pro']);
  });

  it('has no tab stop in a disabled group and disables every radio', async () => {
    mountView(groupView({ group: { disabled: true, defaultValue: 'free' } }));
    await nextTick();
    expect(tabStops()).toEqual([]);
    for (const input of screen.getAllByRole<HTMLInputElement>('radio')) expect(input.disabled).toBe(true);
    expect(must(document.querySelector('.cck-radio')).hasAttribute('data-disabled')).toBe(true);
  });

  it('disables the radios of a disabled fieldset', async () => {
    mountView(() => h('fieldset', { disabled: true }, groupView()()));
    await nextTick();
    await nextTask();
    for (const input of screen.getAllByRole<HTMLInputElement>('radio')) expect(input.disabled).toBe(true);
  });
});

describe('RadioGroup forms', () => {
  const formView =
    (groupProps: Record<string, unknown> = {}, onSubmit?: (event: Event) => void) =>
    () =>
      h(
        'form',
        {
          id: 'f',
          onSubmit:
            onSubmit ??
            ((event: Event) => {
              event.preventDefault();
            }),
        },
        [
          h(RadioGroup, { name: 'plan', 'aria-label': 'Plan', ...groupProps }, () =>
            ['free', 'pro'].map((value) => h(Radio, { key: value, value }, () => value)),
          ),
          h('button', { type: 'submit' }, 'send'),
        ],
      );

  it('submits name=value of the checked radio, and nothing when none is checked', () => {
    mountView(formView({ defaultValue: 'pro' }));
    const form = must(document.querySelector('form'));
    expect([...new FormData(form).entries()]).toEqual([['plan', 'pro']]);
    cleanup();
    mountView(formView());
    expect([...new FormData(must(document.querySelector('form'))).entries()]).toEqual([]);
  });

  it('uses one generated name for the radios and keeps it stable', () => {
    mountView(groupView());
    const names = new Set(screen.getAllByRole<HTMLInputElement>('radio').map((input) => input.name));
    expect(names.size).toBe(1);
    expect([...names][0]).not.toBe('');
    expect(group().hasAttribute('name')).toBe(false);
  });

  it('blocks submit while required and none is checked', async () => {
    const submit = vi.fn((event: Event) => {
      event.preventDefault();
    });
    mountView(formView({ required: true }, submit));
    const form = must(document.querySelector<HTMLFormElement>('form'));
    expect(form.checkValidity()).toBe(false);
    for (const input of screen.getAllByRole<HTMLInputElement>('radio')) expect(input.required).toBe(true);
    await userEvent.click(radio('free'));
    expect(form.checkValidity()).toBe(true);
  });

  it('passes the group form to radios without their own, and the own form wins', () => {
    mountView(() =>
      h(RadioGroup, { form: 'f', name: 'plan', 'aria-label': 'Plan' }, () => [
        h(Radio, { value: 'free' }, () => 'Free'),
        h(Radio, { value: 'pro', form: 'g' }, () => 'Pro'),
      ]),
    );
    expect(radio('Free').getAttribute('form')).toBe('f');
    expect(radio('Pro').getAttribute('form')).toBe('g');
  });

  it('restores the mount value on reset and emits once only when it changed', async () => {
    const updates: unknown[] = [];
    mountView(formView({ defaultValue: 'free', 'onUpdate:modelValue': (v: unknown) => updates.push(v) }));
    const form = must(document.querySelector<HTMLFormElement>('form'));
    await nextTick();
    form.reset();
    await nextTask();
    expect(updates).toEqual([]);
    expect(checkedLabels()).toEqual(['free']);
    await userEvent.click(radio('pro'));
    expect(updates).toEqual(['pro']);
    form.reset();
    await nextTask();
    await nextTask();
    expect(updates).toEqual(['pro', 'free']);
    expect(checkedLabels()).toEqual(['free']);
  });

  it('restores the mount value of a bound null group, not the default value, on reset', async () => {
    const updates: unknown[] = [];
    mountView(
      formView({ modelValue: null, defaultValue: 'free', 'onUpdate:modelValue': (v: unknown) => updates.push(v) }),
    );
    await nextTick();
    expect(checkedLabels()).toEqual([]);
    must(document.querySelector<HTMLFormElement>('form')).reset();
    await nextTask();
    await nextTask();
    expect(checkedLabels()).toEqual([]);
    expect(updates).toEqual([]);
  });

  it('resets to none when the group started with none', async () => {
    const updates: unknown[] = [];
    mountView(formView({ 'onUpdate:modelValue': (v: unknown) => updates.push(v) }));
    await userEvent.click(radio('pro'));
    must(document.querySelector<HTMLFormElement>('form')).reset();
    await nextTask();
    await nextTask();
    expect(updates).toEqual(['pro', null]);
    expect(checkedLabels()).toEqual([]);
  });
});

describe('RadioGroup development warnings and outside use', () => {
  it('warns for a radio in a group without a value', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(RadioGroup, null, () => h(Radio, null, () => 'None')));
    await nextTick();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no value'));
  });

  it('does not warn about a missing name inside a group', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(groupView());
    await nextTick();
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps a standalone Radio unchanged: no tabindex, own events', async () => {
    const events: boolean[] = [];
    mountView(() =>
      h(Radio, { name: 'solo', 'onUpdate:modelValue': (checked: boolean) => events.push(checked) }, () => 'Solo'),
    );
    expect(radio('Solo').hasAttribute('tabindex')).toBe(false);
    await fireEvent.click(radio('Solo'));
    expect(events).toEqual([true]);
  });

  it('exposes the root element', async () => {
    const reference = ref<{ element: Element | null } | null>(null);
    mountView(() =>
      h(RadioGroup, { ref: reference, 'aria-label': 'Plan' }, () => h(Radio, { value: 'free' }, () => 'Free')),
    );
    await nextTick();
    expect(reference.value?.element).toBe(group());
  });
});
