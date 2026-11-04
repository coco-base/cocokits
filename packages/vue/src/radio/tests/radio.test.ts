// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Radio } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { must, nextTask } from '../../internal/tests/choice-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const radio = (name: string): HTMLInputElement => screen.getByRole<HTMLInputElement>('radio', { name });
const roots = (): Element[] => [...document.querySelectorAll('.cck-radio')];

type Plan = 'free' | 'pro';

/** Two radios of one group whose models are written from one selected value. */
function mountGroup(initial: Plan | null = 'free') {
  const selected = ref<Plan | null>(initial);
  const events: { plan: Plan; checked: boolean }[] = [];
  const one = (plan: Plan, label: string) =>
    h(
      Radio,
      {
        name: 'plan',
        value: plan,
        modelValue: selected.value === plan,
        'onUpdate:modelValue': (next: unknown) => {
          if (next === true) selected.value = plan;
          events.push({ plan, checked: next === true });
        },
      },
      () => label,
    );
  mountView(() => h('fieldset', null, [h('legend', null, 'Plan'), one('free', 'Free'), one('pro', 'Pro')]));
  return { selected, events };
}

describe('Radio', () => {
  it('renders the anatomy and only the radio facts', () => {
    mountView(() => h(Radio, { name: 'plan', required: true }, () => 'Free'));
    const root = must(roots()[0]);
    expect(root.tagName).toBe('DIV');
    const input = radio('Free');
    expect(root.querySelector('.cck-radio__wrapper > .cck-radio__input-wrapper > input.cck-radio__input')).toBe(input);
    expect(input.type).toBe('radio');
    expect(input.id).not.toBe('');
    expect(root.querySelector('.cck-radio__label')?.getAttribute('for')).toBe(input.id);
    expect(input.required).toBe(true);
    expect(root.getAttributeNames().filter((name) => name.startsWith('data-'))).toEqual(['data-required']);
    for (const part of ['backdrop', 'background']) {
      expect(root.querySelector(`.cck-radio__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(input.hasAttribute('aria-readonly')).toBe(false);
  });

  it('routes id, name and aria attributes to the input and none to the root', () => {
    mountView(() =>
      h(Radio, { id: 'mine', name: 'plan', 'aria-describedby': 'd', value: 'free', class: 'mine' }, () => 'Free'),
    );
    const root = must(roots()[0]);
    expect(radio('Free').id).toBe('mine');
    expect(radio('Free').value).toBe('free');
    expect(radio('Free').getAttribute('aria-describedby')).toBe('d');
    for (const name of ['id', 'name', 'aria-describedby', 'value']) expect(root.hasAttribute(name), name).toBe(false);
    expect(root.classList.contains('mine')).toBe(true);
  });

  it('reserves role, aria-invalid and aria-readonly: an author value never reaches the input', () => {
    mountView(() =>
      h(Radio, { name: 'plan', role: 'menuitemradio', 'aria-invalid': 'true', 'aria-readonly': 'true' }, () => 'Free'),
    );
    expect(radio('Free').hasAttribute('role')).toBe(false);
    expect(radio('Free').hasAttribute('aria-invalid')).toBe(false);
    expect(radio('Free').hasAttribute('aria-readonly')).toBe(false);
  });

  it('sends a native hidden to the root and not to the input', () => {
    mountView(() => h(Radio, { name: 'plan', hidden: true }, () => 'Free'));
    expect(must(roots()[0]).hasAttribute('hidden')).toBe(true);
    expect(must(document.querySelector('input')).hasAttribute('hidden')).toBe(false);
  });

  it('blocks checkValidity while required and none of the group is checked', async () => {
    mountView(() =>
      h('form', null, [
        h(Radio, { name: 'plan', required: true, value: 'free' }, () => 'Free'),
        h(Radio, { name: 'plan', required: true, value: 'pro' }, () => 'Pro'),
      ]),
    );
    const form = must(document.querySelector('form'));
    expect(form.checkValidity()).toBe(false);
    await userEvent.click(radio('Pro'));
    expect(form.checkValidity()).toBe(true);
  });

  it('re-targets submit through the form attribute', async () => {
    mountView(() => [h('form', { id: 'f' }), h(Radio, { name: 'plan', value: 'free', form: 'f' }, () => 'Free')]);
    await userEvent.click(radio('Free'));
    expect(new FormData(must(document.querySelector<HTMLFormElement>('form#f'))).get('plan')).toBe('free');
  });

  it('unchecks the other radio of the group and emits on it', async () => {
    const { selected, events } = mountGroup();
    expect(radio('Free').checked).toBe(true);
    await userEvent.click(radio('Pro'));
    await nextTick();
    expect(selected.value).toBe('pro');
    expect(radio('Free').checked).toBe(false);
    expect(roots()[0]?.hasAttribute('data-checked')).toBe(false);
    expect(roots()[1]?.hasAttribute('data-checked')).toBe(true);
    // The old radio is unchecked before the new one is checked.
    expect(events).toEqual([
      { plan: 'free', checked: false },
      { plan: 'pro', checked: true },
    ]);
  });

  it('follows the group when the arrow key checks the next radio', async () => {
    const { selected } = mountGroup();
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(radio('Free'));
    await user.keyboard('{ArrowDown}');
    await nextTick();
    expect(radio('Pro').checked).toBe(true);
    expect(selected.value).toBe('pro');
    expect(radio('Free').checked).toBe(false);
    expect(roots()[0]?.hasAttribute('data-checked')).toBe(false);
  });

  it('follows the group when the radios keep their own state', async () => {
    mountView(() =>
      h('fieldset', null, [h(Radio, { name: 'p', modelValue: true }, () => 'A'), h(Radio, { name: 'p' }, () => 'B')]),
    );
    await userEvent.click(radio('B'));
    await nextTick();
    expect(radio('A').checked).toBe(false);
    expect(roots()[0]?.hasAttribute('data-checked')).toBe(false);
    expect(roots()[1]?.hasAttribute('data-checked')).toBe(true);
  });

  it('emits nothing for a parent write', async () => {
    const { selected, events } = mountGroup();
    selected.value = 'pro';
    await nextTick();
    expect(radio('Pro').checked).toBe(true);
    expect(radio('Free').checked).toBe(false);
    expect(events).toEqual([]);
  });

  it('does not report a radio of another name', async () => {
    const events: string[] = [];
    mountView(() => [
      h(Radio, { name: 'a', modelValue: true, 'onUpdate:modelValue': () => events.push('a') }, () => 'A'),
      h(Radio, { name: 'b', 'onUpdate:modelValue': () => events.push('b') }, () => 'B'),
    ]);
    await userEvent.click(radio('B'));
    expect(events).toEqual(['b']);
    expect(radio('A').checked).toBe(true);
  });

  it('re-syncs the DOM when the parent rejects a change', async () => {
    mountView(() => h(Radio, { name: 'p', modelValue: false, 'onUpdate:modelValue': () => undefined }, () => 'A'));
    await userEvent.click(radio('A'));
    await nextTick();
    expect(radio('A').checked).toBe(false);
    expect(roots()[0]?.hasAttribute('data-checked')).toBe(false);
  });

  it('submits the checked radio value and restores the mount value on reset', async () => {
    const seen: boolean[] = [];
    mountView(() =>
      h('form', null, [
        h(
          Radio,
          {
            name: 'plan',
            value: 'free',
            modelValue: true,
            'onUpdate:modelValue': (value: boolean) => seen.push(value),
          },
          () => 'Free',
        ),
        h(Radio, { name: 'plan', value: 'pro' }, () => 'Pro'),
      ]),
    );
    const form = must(document.querySelector('form'));
    expect(new FormData(form).get('plan')).toBe('free');
    await userEvent.click(radio('Pro'));
    expect(new FormData(form).get('plan')).toBe('pro');
    seen.length = 0;
    form.reset();
    await nextTask();
    await nextTick();
    expect(radio('Free').checked).toBe(true);
    expect(new FormData(form).get('plan')).toBe('free');
    expect(seen).toEqual([true]);
  });

  it('renders data-disabled from a disabling fieldset', async () => {
    const disabled = ref(false);
    mountView(() => h('fieldset', { disabled: disabled.value }, [h(Radio, { name: 'plan' }, () => 'Free')]));
    disabled.value = true;
    await vi.waitFor(() => {
      expect(roots()[0]?.hasAttribute('data-disabled')).toBe(true);
    });
    expect(radio('Free').disabled).toBe(true);
  });

  it('renders the element of `as` and merges onto the child with asChild', () => {
    mountView(() => [
      h(Radio, { as: 'section', name: 'a' }, () => 'A'),
      h(Radio, { asChild: true, name: 'b' }, () => h('p', { class: 'host' }, 'B')),
    ]);
    expect(document.querySelector('section')?.classList.contains('cck-radio')).toBe(true);
    expect(must(document.querySelector('p.host')).querySelector('label')?.textContent).toBe('B');
  });

  describe('development warnings', () => {
    it('warns once for a radio without a name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      mountView(() => h(Radio, null, () => 'Free'));
      expect(warn).toHaveBeenCalledTimes(1);
      expect(String(warn.mock.calls[0]?.[0])).toContain('Radio has no name');
    });

    it('does not warn with a name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      mountView(() => h(Radio, { name: 'plan' }, () => 'Free'));
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

describe('Radio defaultChecked', () => {
  it('starts checked, follows the group, and an update listener alone leaves it uncontrolled', async () => {
    const update = vi.fn();
    mountView(() => [
      h(Radio, { name: 'plan', defaultChecked: true, 'onUpdate:modelValue': update }, () => 'Free'),
      h(Radio, { name: 'plan' }, () => 'Pro'),
    ]);
    expect(radio('Free').checked).toBe(true);
    await userEvent.click(radio('Pro'));
    expect(radio('Free').checked).toBe(false);
    expect(update).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('is ignored when the model is bound, and a bound model with a listener is controlled', async () => {
    const update = vi.fn();
    mountView(() =>
      h(Radio, { name: 'plan', modelValue: false, defaultChecked: true, 'onUpdate:modelValue': update }, () => 'Free'),
    );
    expect(radio('Free').checked).toBe(false);
    await userEvent.click(radio('Free'));
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(radio('Free').checked).toBe(false);
  });

  it('starts local state from a model bound without a listener', async () => {
    mountView(() => [
      h(Radio, { name: 'plan', modelValue: true, defaultChecked: false }, () => 'Free'),
      h(Radio, { name: 'plan' }, () => 'Pro'),
    ]);
    expect(radio('Free').checked).toBe(true);
    await userEvent.click(radio('Pro'));
    expect(radio('Free').checked).toBe(false);
  });
});
