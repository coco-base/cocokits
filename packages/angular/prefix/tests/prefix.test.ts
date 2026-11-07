import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { prefixAnatomy, prefixMeta } from '@cocokits/machines/prefix';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckPrefix, CckPrefixImports } from '../index';

const imports = [...CckPrefixImports];

describe('CckPrefix', () => {
  it('renders the meta default element with the anatomy class and no ARIA, and passes attributes through', async () => {
    const { container } = await render(`<div cckPrefix id="z" data-x="1">content</div>`, { imports });
    const zone = container.querySelector('.cck-prefix');
    expect(zone?.tagName.toLowerCase()).toBe(prefixMeta.defaultElements?.root);
    expect(zone?.className).toBe(prefixAnatomy.classes.root);
    expect(zone?.id).toBe('z');
    expect(zone?.getAttribute('data-x')).toBe('1');
    expect(zone?.textContent).toBe('content');
    expect(zone?.hasAttribute('role')).toBe(false);
    expect(zone?.hasAttribute('style')).toBe(false);
  });

  it('renders the same class on another element and works outside a FormField', async () => {
    const { container } = await render(`<span cckPrefix>content</span>`, { imports });
    expect(container.querySelector('span')?.className).toBe(prefixAnatomy.classes.root);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<div cckPrefix #z="cckPrefix">content</div>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckPrefix)).toBeInstanceOf(CckPrefix);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [prefixAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(prefixAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<div cckPrefix>content</div>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-prefix')?.getAttribute('data-probe')).toBe('on');
  });
});
