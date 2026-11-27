// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { h, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { labelAnatomy, labelMeta } from '@cocokits/machines/label';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [labelAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(labelAnatomy.parts) },
    },
  },
});

describe('Label (rendered contract)', () => {
  it('renders a native label with the class, the meta element, no data-* and no style', () => {
    const { container } = mountView(() => h(Label, null, () => 'Email'));
    const root = pick(container, '.cck-label');
    expect(root.tagName).toBe('LABEL');
    expect(root.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.root);
    expect(root.textContent).toBe('Email');
    expect(root.getAttributeNames().filter((name) => name !== 'class')).toEqual([]);
  });

  it('passes for, id and other native attributes through', () => {
    const { container } = mountView(() =>
      h(Label, { for: 'email', id: 'email-label', class: 'mine', title: 'T' }, () => 'Email'),
    );
    const root = pick(container, '.cck-label');
    expect(root.getAttribute('for')).toBe('email');
    expect(root.id).toBe('email-label');
    expect(root.title).toBe('T');
    expect([...root.classList].sort()).toEqual(['cck-label', 'mine']);
  });

  it('renders the same outside a FormField, and throws nothing', () => {
    expect(() => mountView(() => h(Label))).not.toThrow();
    expect(pick(document.body, '.cck-label').textContent).toBe('');
  });

  it('moves focus to the control it names when clicked', async () => {
    const { container } = mountView(() => [h(Label, { for: 'email' }, () => 'Email'), h('input', { id: 'email' })]);
    await userEvent.click(pick(container, '.cck-label'));
    expect(document.activeElement).toBe(pick(container, '#email'));
  });

  it('puts the theme attribute on its root', () => {
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: allPartsConfig }, () => h(Label)));
    expect(pick(container, '.cck-label').getAttribute('data-probe')).toBe('on');
  });

  it('puts the theme attribute on every part of the anatomy, the marker included', async () => {
    mountView(() =>
      h(ThemeProvider, { themeConfig: allPartsConfig }, () =>
        h(FormField, { required: true }, { label: () => h(Label, null, () => 'Name'), default: () => h(Input) }),
      ),
    );
    await nextTick();
    for (const part of Object.keys(labelAnatomy.parts) as (keyof typeof labelAnatomy.classes)[]) {
      const element = pick(document.body, `.${labelAnatomy.classes[part]}`);
      expect(element.getAttribute('data-probe'), part).toBe('on');
      expect(element.tagName.toLowerCase(), part).toBe(labelMeta.defaultElements?.[part]);
    }
  });

  it('renders the marker as the last child span while required, and none otherwise', async () => {
    mountView(() =>
      h(FormField, { required: true }, { label: () => h(Label, null, () => 'Name'), default: () => h(Input) }),
    );
    await nextTick();
    const label = pick(document.body, '.cck-label');
    const marker = label.lastElementChild;
    expect(marker?.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.requiredMarker);
    expect(marker?.getAttribute('aria-hidden')).toBe('true');
    expect(marker?.textContent).toBe('*');
    expect(label.textContent).toBe('Name*');
  });

  it('has no marker outside a field', () => {
    const { container } = mountView(() => h(Label, null, () => 'Name'));
    expect(container.querySelector('.cck-label__required-marker')).toBeNull();
  });
});
