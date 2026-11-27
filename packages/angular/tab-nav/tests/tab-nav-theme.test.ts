import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckTabNavImports } from '../index';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    [tabNavAnatomy.block]: {
      probe: {
        attrName: 'probe',
        values: ['on'],
        default: 'on',
        partNames: ['root', 'list', 'link', 'indicator'],
      },
    },
  },
});

const template = `<nav cckTabNav aria-label="x"><a cckTabNavLink href="#a">A</a></nav>`;

describe('TabNav theme', () => {
  it('puts the theme attribute on every part with an element', async () => {
    await render(template, { imports: [...CckTabNavImports], providers: [provideCckTheme(themeConfig)] });
    const { root, list, link, indicator } = tabNavAnatomy.classes;
    for (const className of [root, list, link, indicator]) {
      expect(document.querySelector(`.${className}`)?.getAttribute('data-probe'), className).toBe('on');
    }
  });

  it('renders no theme attribute without a theme', async () => {
    await render(template, { imports: [...CckTabNavImports] });
    expect(document.querySelector('[data-probe]')).toBeNull();
  });
});
