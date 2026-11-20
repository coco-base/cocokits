// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { hintAnatomy, hintMeta } from '@cocokits/machines/hint';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Hint } from '../index';
import { mountView, pick } from '../../internal/tests/mount-helpers';

afterEach(cleanup);

const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [hintAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(hintAnatomy.parts) },
    },
  },
});

describe('Hint (rendered contract)', () => {
  it('renders a div with the class, the meta element, no role, no data-* and no style', () => {
    const { container } = mountView(() => h(Hint, null, () => 'Help'));
    const root = pick(container, '.cck-hint');
    expect(root.tagName).toBe('DIV');
    expect(root.tagName.toLowerCase()).toBe(hintMeta.defaultElements?.root);
    expect(root.textContent).toBe('Help');
    expect(root.getAttributeNames()).toEqual(['class']);
  });

  it('passes id and native attributes through', () => {
    const { container } = mountView(() => h(Hint, { id: 'email-hint', class: 'mine' }, () => 'Help'));
    const root = pick(container, '.cck-hint');
    expect(root.id).toBe('email-hint');
    expect([...root.classList].sort()).toEqual(['cck-hint', 'mine']);
  });

  it('renders the same outside a FormField, and throws nothing', () => {
    expect(() => mountView(() => h(Hint))).not.toThrow();
  });

  it('puts the theme attribute on its root', () => {
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: allPartsConfig }, () => h(Hint)));
    expect(pick(container, '.cck-hint').getAttribute('data-probe')).toBe('on');
  });
});
