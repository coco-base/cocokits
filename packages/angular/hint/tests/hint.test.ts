import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { hintAnatomy, hintMeta } from '@cocokits/machines/hint';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckHint, CckHintImports } from '../index';

const imports = [...CckHintImports];

describe('CckHint', () => {
  it('renders the meta default element with the anatomy class and passes id through', async () => {
    const { container } = await render(`<div cckHint id="h">Help</div>`, { imports });
    const hint = container.querySelector('.cck-hint');
    expect(hint?.tagName.toLowerCase()).toBe(hintMeta.defaultElements?.root);
    expect(hint?.className).toBe(hintAnatomy.classes.root);
    expect(hint?.id).toBe('h');
    expect(hint?.hasAttribute('role')).toBe(false);
    expect(hint?.hasAttribute('style')).toBe(false);
  });

  it('renders the same class on another element', async () => {
    const { container } = await render(`<p cckHint>Help</p>`, { imports });
    expect(container.querySelector('p')?.className).toBe(hintAnatomy.classes.root);
  });

  it('renders the same outside a FormField and throws nothing', async () => {
    const { container } = await render(`<div cckHint>Help</div>`, { imports });
    expect(container.querySelector('.cck-hint')?.textContent).toBe('Help');
  });

  it('describes a control through aria-describedby', async () => {
    const { container } = await render(
      `<input aria-label="Email" aria-describedby="h" /><div cckHint id="h">Help</div>`,
      { imports },
    );
    expect(container.querySelector('input')?.getAttribute('aria-describedby')).toBe('h');
    expect((await axe(container)).violations).toEqual([]);
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<div cckHint #h="cckHint">Help</div>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckHint)).toBeInstanceOf(CckHint);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [hintAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(hintAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<div cckHint>Help</div>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(container.querySelector('.cck-hint')?.getAttribute('data-probe')).toBe('on');
  });
});
