import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { trailingAnatomy, trailingMeta } from '@cocokits/machines/trailing';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckTrailing, CckTrailingImports } from '../index';

const imports = [...CckTrailingImports];

describe('CckTrailing', () => {
  it('renders the meta default element with the anatomy class and no ARIA, and passes attributes through', async () => {
    const { container } = await render(`<div cckTrailing id="z" data-x="1">content</div>`, { imports });
    const zone = container.querySelector('.cck-trailing');
    expect(zone?.tagName.toLowerCase()).toBe(trailingMeta.defaultElements?.root);
    expect(zone?.className).toBe(trailingAnatomy.classes.root);
    expect(zone?.id).toBe('z');
    expect(zone?.getAttribute('data-x')).toBe('1');
    expect(zone?.textContent).toBe('content');
    expect(zone?.hasAttribute('role')).toBe(false);
    expect(zone?.hasAttribute('style')).toBe(false);
  });

  it('renders the same class on another element and works outside a FormField', async () => {
    const { container } = await render(`<span cckTrailing>content</span>`, { imports });
    expect(container.querySelector('span')?.className).toBe(trailingAnatomy.classes.root);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<div cckTrailing #z="cckTrailing">content</div>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckTrailing)).toBeInstanceOf(CckTrailing);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [trailingAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(trailingAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<div cckTrailing>content</div>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-trailing')?.getAttribute('data-probe')).toBe('on');
  });
});
