import { render } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { tagAnatomy, tagMeta } from '@cocokits/machines/tag';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckSvgIconImports } from '../../svg-icon';
import { CckTag, CckTagImports } from '../index';

const imports = [...CckTagImports, ...CckSvgIconImports];

function tag(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('.cck-tag');
  if (!el) throw new Error('no tag rendered');
  return el;
}

describe('CckTag', () => {
  it('renders the root on the cck-tag tag with the anatomy class and its text', async () => {
    const { container } = await render(`<cck-tag>Paid</cck-tag>`, { imports });
    const root = tag(container);
    expect(root.tagName).toBe('CCK-TAG');
    expect(root.className).toBe(tagAnatomy.classes.root);
    expect(root.textContent).toBe('Paid');
  });

  it('keeps the consumer classes next to the anatomy class', async () => {
    const { container } = await render(`<cck-tag class="extra">Paid</cck-tag>`, { imports });
    expect([...tag(container).classList].sort()).toEqual([tagAnatomy.classes.root, 'extra'].sort());
  });

  it('keeps a projected icon before or after the text as a direct child', async () => {
    const { container } = await render(
      `<cck-tag><cck-svg-icon iconName="check" />Passed</cck-tag><cck-tag>Failed<cck-svg-icon iconName="close" /></cck-tag>`,
      { imports },
    );
    const [first, second] = container.querySelectorAll<HTMLElement>('.cck-tag');
    expect(first.firstElementChild?.tagName).toBe('CCK-SVG-ICON');
    expect(first.textContent).toBe('Passed');
    expect(second.lastElementChild?.tagName).toBe('CCK-SVG-ICON');
    expect(second.textContent).toBe('Failed');
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<cck-tag #t="cckTag">Paid</cck-tag>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckTag)).toBeInstanceOf(CckTag);
  });

  it('adds no role, aria-*, tabindex, style or undeclared data-*', async () => {
    const { container } = await render(`<cck-tag>Paid</cck-tag>`, { imports });
    const names = Array.from(tag(container).attributes, (a) => a.name);
    expect(names.filter((n) => n === 'role' || n === 'tabindex' || n === 'style' || n.startsWith('aria-'))).toEqual([]);
    const declared: readonly string[] = tagMeta.dataAttrs.root;
    expect(names.filter((n) => n.startsWith('data-') && !declared.includes(n))).toEqual([]);
  });

  it('renders the meta default element for the root as the cck-tag tag', async () => {
    const { container } = await render(`<cck-tag>Paid</cck-tag>`, { imports });
    expect(tagMeta.defaultElements?.root).toBe('span');
    expect(tag(container).tagName.toLowerCase()).toBe('cck-tag');
  });

  it('keeps a role the author writes', async () => {
    const { container } = await render(`<cck-tag role="status">Saved</cck-tag>`, { imports });
    expect(tag(container).getAttribute('role')).toBe('status');
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [tagAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(tagAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<cck-tag>Paid</cck-tag>`, {
      imports,
      providers: [provideCckTheme(themeConfig)],
    });
    expect(tag(container).getAttribute('data-probe')).toBe('on');
  });
});
