// @vitest-environment jsdom
import { cleanup, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { field, must, nextFrame } from '../../internal/tests/choice-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const toggle = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('switch');
const root = (): HTMLElement => must(document.querySelector<HTMLElement>('.cck-switch'));

describe('Switch', () => {
  it('renders a label that wraps the track and the content around a native checkbox with role switch', () => {
    mountView(() => h(Switch, { name: 'n', value: 'yes' }, () => 'Notify me'));
    expect(root().tagName).toBe('DIV');
    const label = must(root().querySelector(':scope > label.cck-switch__label'));
    expect(label.querySelector(':scope > .cck-switch__track > input.cck-switch__input')).toBe(toggle());
    expect(label.textContent.trim()).toBe('Notify me');
    expect(toggle().type).toBe('checkbox');
    expect(label.getAttribute('for')).toBe(toggle().id);
    expect(toggle().id).not.toBe('');
    expect(toggle().name).toBe('n');
    expect(toggle().value).toBe('yes');
    expect(root().hasAttribute('data-indeterminate')).toBe(false);
    expect(toggle().hasAttribute('aria-checked')).toBe(false);
    for (const part of ['thumb', 'backdrop']) {
      expect(root().querySelector(`.cck-switch__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root().querySelector('.cck-switch__track')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('keeps role switch whatever role the author gives', () => {
    mountView(() => h(Switch, { role: 'checkbox' }, () => 'Notify me'));
    expect(toggle().getAttribute('role')).toBe('switch');
  });

  it('toggles from a click on the label, emits once and shows the fact', async () => {
    const events: boolean[] = [];
    const on = ref(false);
    mountView(() =>
      h(
        Switch,
        {
          modelValue: on.value,
          'onUpdate:modelValue': (next: unknown) => {
            on.value = next === true;
            events.push(next === true);
          },
        },
        () => 'Notify me',
      ),
    );
    await userEvent.click(must(document.querySelector('label')));
    expect(toggle().checked).toBe(true);
    expect(on.value).toBe(true);
    expect(root().hasAttribute('data-checked')).toBe(true);
    expect(events).toEqual([true]);
  });

  it('shows a parent write and re-syncs a rejected change', async () => {
    const on = ref(false);
    mountView(() => h(Switch, { modelValue: on.value, 'onUpdate:modelValue': () => undefined }, () => 'Notify me'));
    on.value = true;
    await nextTick();
    expect(toggle().checked).toBe(true);
    await userEvent.click(toggle());
    await nextTick();
    expect(toggle().checked).toBe(true);
    expect(root().hasAttribute('data-checked')).toBe(true);
  });

  it('blocks every user toggle while read-only', async () => {
    const onChecked = vi.fn();
    mountView(() =>
      h(Switch, { readonly: true, modelValue: true, 'onUpdate:modelValue': onChecked }, () => 'Notify me'),
    );
    expect(toggle().getAttribute('aria-readonly')).toBe('true');
    await userEvent.click(toggle());
    await userEvent.click(must(document.querySelector('label')));
    toggle().focus();
    await userEvent.keyboard(' ');
    expect(toggle().checked).toBe(true);
    expect(onChecked).not.toHaveBeenCalled();
  });

  it('does not warn for a caption, and warns when the label holds only the track', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(() => h(Switch, null, () => 'Notify me'));
    await nextFrame();
    expect(warn).not.toHaveBeenCalled();
    cleanup();
    mountView(() => h(Switch));
    await nextFrame();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('is named by the field label and the inner label in a field', async () => {
    mountView(() => field(() => h(Switch, null, () => 'Notify me')));
    await nextTick();
    expect(toggle().id).toBe('f-control');
    expect(screen.getByRole('switch', { name: 'Notifications Notify me' })).toBe(toggle());
    expect(must(document.querySelector('.cck-switch__label')).getAttribute('for')).toBe('f-control');
  });

  it('renders the element of `as` and merges onto the child with asChild', () => {
    mountView(() => [
      h(Switch, { as: 'section' }, () => 'A'),
      h(Switch, { asChild: true }, () => h('p', { class: 'host' }, 'B')),
    ]);
    expect(document.querySelector('section')?.classList.contains('cck-switch')).toBe(true);
    const host = must(document.querySelector('p.host'));
    expect(host.classList.contains('cck-switch')).toBe(true);
    expect(host.querySelector('label')?.textContent).toBe('B');
  });
});

describe('Switch defaultChecked', () => {
  it('starts checked, a user change sticks, and an update listener alone leaves it uncontrolled', async () => {
    const update = vi.fn();
    mountView(() => h(Switch, { defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }));
    expect(toggle().checked).toBe(true);
    await userEvent.click(toggle());
    expect(toggle().checked).toBe(false);
    expect(update).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('is ignored when the model is bound, and a bound model with a listener is controlled', async () => {
    const update = vi.fn();
    mountView(() =>
      h(Switch, { modelValue: false, defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }),
    );
    expect(toggle().checked).toBe(false);
    await userEvent.click(toggle());
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(toggle().checked).toBe(false);
  });

  it('starts local state from a model bound without a listener', async () => {
    mountView(() => h(Switch, { modelValue: true, defaultChecked: false, 'aria-label': 'A' }));
    expect(toggle().checked).toBe(true);
    await userEvent.click(toggle());
    expect(toggle().checked).toBe(false);
  });
});
