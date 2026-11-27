// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { Comment, h, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { Hint } from '../../hint';
import { FormField } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

const hint = () => h(Hint, null, () => 'Help');

describe('FormField as, asChild and the exposed element', () => {
  it('renders the tag given to as, with the class and the zones', () => {
    const { container } = mountView(() => h(FormField, { as: 'section' }, { default: () => h('input'), hint }));
    const root = pick(container, '.cck-form-field');
    expect(root.tagName).toBe('SECTION');
    expect([...root.children].map((child) => child.className)).toEqual([
      'cck-form-field__wrapper',
      'cck-form-field__feedback-wrapper',
    ]);
  });

  it('asChild merges onto the child and renders the zones inside it, around the control', () => {
    const { container } = mountView(() =>
      h(
        FormField,
        { asChild: true, class: 'mine' },
        {
          label: () => h('label', { class: 'cck-label' }, 'Name'),
          default: () => h('fieldset', { id: 'x' }, [h('input', { id: 'name' })]),
          hint,
        },
      ),
    );
    const root = pick(container, '.cck-form-field');
    expect(root.tagName).toBe('FIELDSET');
    expect(root.id).toBe('x');
    expect(root.classList.contains('mine')).toBe(true);
    expect([...root.children].map((child) => child.className)).toEqual([
      'cck-label',
      'cck-form-field__wrapper',
      'cck-form-field__feedback-wrapper',
    ]);
    expect(pick(root, '.cck-form-field__wrapper > .cck-form-field__input-wrapper > input#name')).toBeDefined();
    expect(pick(root, '.cck-form-field__feedback-wrapper > .cck-hint').textContent).toBe('Help');
  });

  it('as="template" means asChild', () => {
    const { container } = mountView(() =>
      h(FormField, { as: 'template' }, { default: () => h('section', null, [h('input')]) }),
    );
    const root = pick(container, '.cck-form-field');
    expect(root.tagName).toBe('SECTION');
    expect(root.querySelector('.cck-form-field__input-wrapper > input')).not.toBeNull();
  });

  it('exposes the root element, also for asChild next to a comment', () => {
    const plain = ref<{ element: Element | null } | null>(null);
    const merged = ref<{ element: Element | null } | null>(null);
    const { container } = mountView(() => [
      h(FormField, { ref: plain, id: 'plain' }),
      h(FormField, { ref: merged, asChild: true, id: 'merged' }, () => [h(Comment, 'note'), h('nav')]),
    ]);
    expect(plain.value?.element).toBe(pick(container, '#plain'));
    expect(merged.value?.element).toBe(pick(container, '#merged'));
  });
});
