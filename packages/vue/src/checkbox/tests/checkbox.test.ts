// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkboxAnatomy } from '@cocokits/machines/checkbox';
import { ThemeProvider } from '@cocokits/vue-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Checkbox } from '../index';
import { mountView } from '../../internal/tests/mount-helpers';
import { box } from './fixtures';
import { must, nextFrame } from '../../internal/tests/choice-helpers';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const root = (): HTMLElement => must(document.querySelector<HTMLElement>('.cck-checkbox'));
const isSet = (element: Element, name: string): boolean => element.hasAttribute(name);

/** A v-model checkbox whose parent records every change. */
function mountBound(initial = false, props: Record<string, unknown> = {}) {
  const checked = ref<boolean | null>(initial);
  const events: boolean[] = [];
  mountView(() =>
    h(
      Checkbox,
      {
        modelValue: checked.value,
        'onUpdate:modelValue': (next: unknown) => {
          checked.value = next === true;
          events.push(next === true);
        },
        name: 'terms',
        'aria-label': 'Terms',
        ...props,
      },
      () => 'Accept the terms',
    ),
  );
  return { checked, events };
}

describe('Checkbox', () => {
  it('renders the anatomy around a native checkbox with the label content', () => {
    mountView(() => h(Checkbox, null, () => 'Accept the terms'));
    expect(root().tagName).toBe('DIV');
    expect(
      root().querySelector('.cck-checkbox__wrapper > .cck-checkbox__input-wrapper > input.cck-checkbox__input'),
    ).toBe(box());
    expect(root().querySelector('.cck-checkbox__wrapper > label.cck-checkbox__label')?.textContent.trim()).toBe(
      'Accept the terms',
    );
    expect(box().type).toBe('checkbox');
    expect(box().hasAttribute('role')).toBe(false);
    for (const part of ['backdrop', 'background']) {
      expect(root().querySelector(`.cck-checkbox__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root().querySelector('.cck-checkbox__input-wrapper')?.hasAttribute('aria-hidden')).toBe(false);
    expect(root().querySelector('[aria-checked]')).toBeNull();
  });

  it('routes the control attributes to the input and the layout attributes to the root', () => {
    const exposed = ref<{ element: Element | null; inputElement: HTMLInputElement | null } | null>(null);
    mountView(() =>
      h(
        Checkbox,
        {
          ref: exposed,
          id: 'terms',
          name: 'terms',
          form: 'f',
          value: 'yes',
          'aria-label': 'Terms',
          'data-extra': 'x',
          class: 'mine',
          style: { color: 'red' },
        },
        () => 'Accept',
      ),
    );
    expect(box().id).toBe('terms');
    expect(box().name).toBe('terms');
    expect(box().value).toBe('yes');
    expect(box().getAttribute('form')).toBe('f');
    expect(box().getAttribute('aria-label')).toBe('Terms');
    expect(box().getAttribute('data-extra')).toBe('x');
    for (const name of ['id', 'name', 'form', 'aria-label', 'value', 'data-extra']) {
      expect(root().hasAttribute(name), name).toBe(false);
    }
    expect([...root().classList].sort()).toEqual(['cck-checkbox', 'mine']);
    expect(root().style.color).toBe('red');
    expect(box().classList.contains('mine')).toBe(false);
    expect(exposed.value?.element).toBe(root());
    expect(exposed.value?.inputElement).toBe(box());
  });

  it('reserves role: an author role never reaches the input', () => {
    mountView(() => h(Checkbox, { role: 'switch' }, () => 'Caption'));
    expect(box().hasAttribute('role')).toBe(false);
  });

  it('composes the listeners of the author on the input with its own', async () => {
    const onFocus = vi.fn();
    const onChange = vi.fn();
    mountView(() => h(Checkbox, { onFocus, onChange }, () => 'Caption'));
    await userEvent.click(box());
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(isSet(root(), 'data-checked')).toBe(true);
    expect(isSet(root(), 'data-focused')).toBe(true);
  });

  it('points the label at the input and generates an id when there is none', () => {
    mountView(() => h(Checkbox, null, () => 'Caption'));
    expect(box().id).not.toBe('');
    expect(document.querySelector('label')?.getAttribute('for')).toBe(box().id);
    expect(box().labels?.length).toBe(1);
  });

  it('renders the element of `as` and merges onto the child with asChild', () => {
    mountView(() => [
      h(Checkbox, { as: 'section', 'data-testid': 'a' }, () => 'A'),
      h(Checkbox, { asChild: true, id: 'b' }, () => h('p', { class: 'host' }, 'B')),
    ]);
    const section = document.querySelector('section');
    expect(section?.classList.contains('cck-checkbox')).toBe(true);
    const host = must(document.querySelector('p.host'));
    expect(host.classList.contains('cck-checkbox')).toBe(true);
    expect(host.querySelector('label')?.textContent).toBe('B');
    expect(host.querySelector('input')?.id).toBe('b');
  });

  it('toggles on a click and emits update:modelValue once', async () => {
    const { checked, events } = mountBound();
    await userEvent.click(box());
    expect(checked.value).toBe(true);
    expect(box().checked).toBe(true);
    expect(isSet(root(), 'data-checked')).toBe(true);
    expect(isSet(root(), 'data-dirty')).toBe(true);
    expect(events).toEqual([true]);
  });

  it('toggles on a click on the label and on Space', async () => {
    const { checked, events } = mountBound();
    await userEvent.click(must(document.querySelector('label')));
    expect(checked.value).toBe(true);
    box().focus();
    await userEvent.keyboard(' ');
    expect(checked.value).toBe(false);
    expect(events).toEqual([true, false]);
  });

  it('starts from defaultChecked and stays uncontrolled beside an update listener', async () => {
    const events: boolean[] = [];
    mountView(() =>
      h(Checkbox, {
        defaultChecked: true,
        'onUpdate:modelValue': (value: boolean) => events.push(value),
        'aria-label': 'A',
      }),
    );
    expect(box().checked).toBe(true);
    await userEvent.click(box());
    expect(box().checked).toBe(false);
    expect(events).toEqual([false]);
  });

  it('toggles by itself when nothing is bound', async () => {
    mountView(() => h(Checkbox, { 'aria-label': 'A' }));
    await userEvent.click(box());
    expect(box().checked).toBe(true);
    expect(isSet(root(), 'data-checked')).toBe(true);
  });

  it('shows a parent write and emits nothing for it', async () => {
    const { checked, events } = mountBound(true);
    expect(box().checked).toBe(true);
    expect(isSet(root(), 'data-checked')).toBe(true);
    checked.value = false;
    await nextTick();
    expect(box().checked).toBe(false);
    expect(isSet(root(), 'data-checked')).toBe(false);
    expect(events).toEqual([]);
  });

  it('re-syncs the DOM when the parent rejects a change', async () => {
    const events: boolean[] = [];
    mountView(() =>
      h(Checkbox, {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean) => events.push(value),
        'aria-label': 'A',
      }),
    );
    await userEvent.click(box());
    await nextTick();
    expect(events).toHaveLength(1);
    expect(box().checked).toBe(false);
    expect(isSet(root(), 'data-checked')).toBe(false);
  });

  it('treats a nullish model as unchecked and does not echo it', () => {
    const onChecked = vi.fn();
    mountView(() => h(Checkbox, { modelValue: null, 'onUpdate:modelValue': onChecked, 'aria-label': 'A' }));
    expect(box().checked).toBe(false);
    expect(onChecked).not.toHaveBeenCalled();
  });

  it('renders the mixed fact and sets the DOM property, and the prop wins after a click', async () => {
    const indeterminate = ref(true);
    const { checked, events } = mountBound(false, {
      get indeterminate() {
        return indeterminate.value;
      },
    });
    await nextTick();
    expect(isSet(root(), 'data-indeterminate')).toBe(true);
    expect(box().indeterminate).toBe(true);
    await userEvent.click(box());
    expect(checked.value).toBe(true);
    expect(box().indeterminate).toBe(true);
    expect(events).toHaveLength(1);
    indeterminate.value = false;
    await nextTick();
    expect(box().indeterminate).toBe(false);
    expect(isSet(root(), 'data-indeterminate')).toBe(false);
  });

  it('keeps a controlled mixed checkbox indeterminate after repeated clicks', async () => {
    mountView(() =>
      h(Checkbox, {
        modelValue: false,
        indeterminate: true,
        'onUpdate:modelValue': () => undefined,
        'aria-label': 'A',
      }),
    );
    for (let click = 0; click < 3; click++) {
      await userEvent.click(box());
      await nextTick();
      expect(box().indeterminate).toBe(true);
      expect(box().checked).toBe(false);
    }
  });

  it('blocks every user toggle while read-only, stays focusable and submits', async () => {
    const events: boolean[] = [];
    mountView(() =>
      h('form', null, [
        h(
          Checkbox,
          {
            readonly: true,
            name: 'a',
            modelValue: true,
            'onUpdate:modelValue': (value: boolean) => events.push(value),
          },
          () => 'Caption',
        ),
      ]),
    );
    expect(box().getAttribute('aria-readonly')).toBe('true');
    expect(isSet(root(), 'data-readonly')).toBe(true);
    await userEvent.click(box());
    await userEvent.click(must(document.querySelector('label')));
    box().focus();
    await userEvent.keyboard(' ');
    expect(box().checked).toBe(true);
    expect(events).toEqual([]);
    expect(document.activeElement).toBe(box());
    expect(new FormData(must(document.querySelector('form'))).get('a')).toBe('on');
  });

  it('blocks a controlled read-only toggle too', async () => {
    const onChecked = vi.fn();
    mountView(() =>
      h(Checkbox, { readonly: true, modelValue: false, 'onUpdate:modelValue': onChecked, 'aria-label': 'A' }),
    );
    await userEvent.click(box());
    expect(box().checked).toBe(false);
    expect(onChecked).not.toHaveBeenCalled();
  });

  it('renders disabled natively and as a fact, and hidden on the root', () => {
    mountView(() => h(Checkbox, { disabled: true, hidden: true }, () => 'Caption'));
    expect(must(document.querySelector('input')).disabled).toBe(true);
    expect(isSet(root(), 'data-disabled')).toBe(true);
    expect(root().hidden).toBe(true);
  });

  it('renders aria-invalid only after the control was touched', async () => {
    mountView(() => h(Checkbox, { invalid: true }, () => 'Caption'));
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    await userEvent.click(box());
    await userEvent.tab();
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(root(), 'data-touched')).toBe(true);
  });

  it('takes no focus on mount', () => {
    mountView(() => h(Checkbox, null, () => 'Caption'));
    expect(document.activeElement).toBe(document.body);
  });

  it('puts the theme attributes of the anatomy parts on their parts', () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [checkboxAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: ['root', 'input', 'label'] },
        },
      },
    });
    mountView(() => h(ThemeProvider, { themeConfig }, () => h(Checkbox, null, () => 'Caption')));
    expect(root().getAttribute('data-probe')).toBe('on');
    expect(box().getAttribute('data-probe')).toBe('on');
    expect(document.querySelector('label')?.getAttribute('data-probe')).toBe('on');
    expect(document.querySelector('.cck-checkbox__wrapper')?.hasAttribute('data-probe')).toBe(false);
  });

  it('updates the label content when the slot changes', async () => {
    const caption = ref('One');
    mountView(() => h(Checkbox, null, () => caption.value));
    caption.value = 'Two';
    await nextTick();
    expect(document.querySelector('label')?.textContent).toBe('Two');
  });

  describe('accessible name warning', () => {
    const warn = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    it('warns for an empty label part with no other name', async () => {
      const spy = warn();
      mountView(() => h(Checkbox));
      await nextFrame();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(String(spy.mock.calls[0]?.[0])).toContain('no accessible name');
    });

    it.each<[string, Record<string, unknown>, string | undefined]>([
      ['content', {}, 'Caption'],
      ['aria-label', { 'aria-label': 'Name' }, undefined],
      ['aria-labelledby', { 'aria-labelledby': 'x' }, undefined],
      ['title', { title: 'Name' }, undefined],
    ])('does not warn with %s', async (_name, attrs, text) => {
      const spy = warn();
      mountView(() => h(Checkbox, attrs, text ? () => text : undefined));
      await nextFrame();
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not warn when a label outside points at the id', async () => {
      const spy = warn();
      mountView(() => [h('label', { for: 'mine' }, 'Outside'), h(Checkbox, { id: 'mine' })]);
      await nextFrame();
      expect(spy).not.toHaveBeenCalled();
    });
  });
});

describe('Checkbox defaultChecked, bound', () => {
  it('starts checked, a user change sticks, and an update listener alone leaves it uncontrolled', async () => {
    const update = vi.fn();
    mountView(() => h(Checkbox, { defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }));
    expect(box().checked).toBe(true);
    await userEvent.click(box());
    expect(box().checked).toBe(false);
    expect(update).toHaveBeenCalledExactlyOnceWith(false);
  });

  it('is ignored when the model is bound, and a bound model with a listener is controlled', async () => {
    const update = vi.fn();
    mountView(() =>
      h(Checkbox, { modelValue: false, defaultChecked: true, 'onUpdate:modelValue': update, 'aria-label': 'A' }),
    );
    expect(box().checked).toBe(false);
    await userEvent.click(box());
    await nextTick();
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(box().checked).toBe(false);
  });

  it('starts local state from a model bound without a listener', async () => {
    mountView(() => h(Checkbox, { modelValue: true, defaultChecked: false, 'aria-label': 'A' }));
    expect(box().checked).toBe(true);
    await userEvent.click(box());
    expect(box().checked).toBe(false);
  });
});
