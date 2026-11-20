import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { suffixAnatomy, suffixMeta } from '@cocokits/machines/suffix';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckSuffix, CckSuffixImports } from '../index';

const imports = [...CckSuffixImports];

describe('CckSuffix', () => {
  it('renders the meta default element with the anatomy class and no ARIA, and passes attributes through', async () => {
    const { container } = await render(`<div cckSuffix id="z" data-x="1">content</div>`, { imports });
    const zone = container.querySelector('.cck-suffix');
    expect(zone?.tagName.toLowerCase()).toBe(suffixMeta.defaultElements?.root);
    expect(zone?.className).toBe(suffixAnatomy.classes.root);
    expect(zone?.id).toBe('z');
    expect(zone?.getAttribute('data-x')).toBe('1');
    expect(zone?.textContent).toBe('content');
    expect(zone?.hasAttribute('role')).toBe(false);
    expect(zone?.hasAttribute('style')).toBe(false);
  });

  it('renders the same class on another element and works outside a FormField', async () => {
    const { container } = await render(`<span cckSuffix>content</span>`, { imports });
    expect(container.querySelector('span')?.className).toBe(suffixAnatomy.classes.root);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<div cckSuffix #z="cckSuffix">content</div>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckSuffix)).toBeInstanceOf(CckSuffix);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [suffixAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(suffixAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<div cckSuffix>content</div>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-suffix')?.getAttribute('data-probe')).toBe('on');
  });
});
