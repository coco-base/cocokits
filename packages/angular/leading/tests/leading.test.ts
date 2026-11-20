import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { leadingAnatomy, leadingMeta } from '@cocokits/machines/leading';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckLeading, CckLeadingImports } from '../index';

const imports = [...CckLeadingImports];

describe('CckLeading', () => {
  it('renders the meta default element with the anatomy class and no ARIA, and passes attributes through', async () => {
    const { container } = await render(`<div cckLeading id="z" data-x="1">content</div>`, { imports });
    const zone = container.querySelector('.cck-leading');
    expect(zone?.tagName.toLowerCase()).toBe(leadingMeta.defaultElements?.root);
    expect(zone?.className).toBe(leadingAnatomy.classes.root);
    expect(zone?.id).toBe('z');
    expect(zone?.getAttribute('data-x')).toBe('1');
    expect(zone?.textContent).toBe('content');
    expect(zone?.hasAttribute('role')).toBe(false);
    expect(zone?.hasAttribute('style')).toBe(false);
  });

  it('renders the same class on another element and works outside a FormField', async () => {
    const { container } = await render(`<span cckLeading>content</span>`, { imports });
    expect(container.querySelector('span')?.className).toBe(leadingAnatomy.classes.root);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<div cckLeading #z="cckLeading">content</div>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckLeading)).toBeInstanceOf(CckLeading);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [leadingAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(leadingAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<div cckLeading>content</div>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-leading')?.getAttribute('data-probe')).toBe('on');
  });
});
