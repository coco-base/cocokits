// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { formFieldAnatomy, formFieldMeta } from '@cocokits/machines/form-field';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [formFieldAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(formFieldAnatomy.parts) },
    },
  },
});

const labelSlot = () => h(Label, { for: 'email' }, () => 'Email');
const control = () => h('input', { id: 'email', 'aria-describedby': 'email-hint' });
const hintSlot = () => h(Hint, { id: 'email-hint' }, () => 'We only use it for the receipt.');

const field = () => h(FormField, null, { label: labelSlot, default: control, hint: hintSlot });

/**
 * What Selectors 4 `:empty` checks: no element child and no text, comments and zero-length text nodes ignored.
 * jsdom's own `:empty` counts the zero-length text nodes that Vue puts around a slot, browsers do not.
 */
function isEmptyPerSelectors(element: Element): boolean {
  return [...element.childNodes].every(
    (node) => node.nodeType === Node.COMMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.nodeValue === ''),
  );
}

describe('FormField (rendered contract)', () => {
  it('renders the parts in order: label, wrapper > inputWrapper > control, feedbackWrapper > hint', () => {
    const { container } = mountView(field);
    const root = pick(container, '.cck-form-field');
    expect([...root.children].map((child) => child.className)).toEqual([
      'cck-label',
      'cck-form-field__wrapper',
      'cck-form-field__feedback-wrapper',
    ]);
    expect(pick(container, '.cck-form-field__wrapper > .cck-form-field__input-wrapper > input#email')).toBeDefined();
    expect(pick(container, '.cck-form-field__feedback-wrapper > .cck-hint').id).toBe('email-hint');
    expect(pick(container, '.cck-form-field > .cck-label').getAttribute('for')).toBe('email');
  });

  it('keeps the order whatever order the slots are written in', () => {
    const { container } = mountView(() => h(FormField, null, { hint: hintSlot, default: control, label: labelSlot }));
    expect([...pick(container, '.cck-form-field').children].map((child) => child.className)).toEqual([
      'cck-label',
      'cck-form-field__wrapper',
      'cck-form-field__feedback-wrapper',
    ]);
  });

  it('allows several hints in the feedback zone', () => {
    const { container } = mountView(() =>
      h(FormField, null, { default: control, hint: () => [h(Hint, null, () => 'One'), h(Hint, null, () => 'Two')] }),
    );
    expect(container.querySelectorAll('.cck-form-field__feedback-wrapper > .cck-hint')).toHaveLength(2);
  });

  it('renders each part with the default element of the meta, and the class of the anatomy', () => {
    const { container } = mountView(field);
    for (const part of Object.keys(formFieldAnatomy.parts) as (keyof typeof formFieldAnatomy.classes)[]) {
      const element = pick(container, `.${formFieldAnatomy.classes[part]}`);
      expect(element.tagName.toLowerCase(), part).toBe(formFieldMeta.defaultElements?.[part]);
      expect(
        element.getAttributeNames().filter((name) => name.startsWith('data-')),
        part,
      ).toEqual([]);
      expect(element.hasAttribute('role'), part).toBe(false);
    }
  });

  it('falls attrs through to the root, and binds no style', () => {
    const { container } = mountView(() => h(FormField, { class: 'mine', id: 'f' }));
    const root = pick(container, '.cck-form-field');
    expect([...root.classList].sort()).toEqual(['cck-form-field', 'mine']);
    expect(root.id).toBe('f');
    expect(root.hasAttribute('style')).toBe(false);
  });

  it('renders the wrappers, empty, when no slot is given', () => {
    const { container } = mountView(() => h(FormField));
    const root = pick(container, '.cck-form-field');
    expect([...root.children].map((child) => child.className)).toEqual([
      'cck-form-field__wrapper',
      'cck-form-field__feedback-wrapper',
    ]);
  });

  // Spec assumption 2: the theme hides an empty feedback zone with `:empty`.
  it('leaves the feedbackWrapper empty in the sense of :empty without a hint, and not matching with one', async () => {
    const withHint = ref(false);
    const { container } = mountView(() =>
      h(FormField, null, { default: control, ...(withHint.value ? { hint: hintSlot } : {}) }),
    );
    const feedback = pick(container, '.cck-form-field__feedback-wrapper');
    expect(isEmptyPerSelectors(feedback)).toBe(true);
    expect(feedback.textContent).toBe('');
    expect(feedback.querySelector('*')).toBeNull();
    withHint.value = true;
    await nextTick();
    expect(isEmptyPerSelectors(feedback)).toBe(false);
  });

  it('leaves the feedbackWrapper empty in the sense of :empty when the hint slot renders nothing', () => {
    const { container } = mountView(() => h(FormField, null, { default: control, hint: () => [] }));
    expect(isEmptyPerSelectors(pick(container, '.cck-form-field__feedback-wrapper'))).toBe(true);
  });
});

describe('FormField theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: allPartsConfig }, field));
    for (const className of Object.values(formFieldAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});
