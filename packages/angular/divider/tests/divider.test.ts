import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { dividerAnatomy, dividerMeta } from '@cocokits/machines/divider';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckDivider, CckDividerImports } from '../index';

const imports = [...CckDividerImports];

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

describe('CckDivider', () => {
  it.each([
    ['horizontal', '', 'horizontal', null, null],
    ['vertical', 'orientation="vertical"', 'vertical', null, 'vertical'],
    ['horizontal decorative', 'decorative', 'horizontal', 'none', null],
    ['vertical decorative', 'orientation="vertical" decorative', 'vertical', 'none', null],
  ])('renders one hr with the contract: %s', async (_name, attrs, orientation, role, ariaOrientation) => {
    const { container } = await render(`<hr cckDivider ${attrs} />`, { imports });
    const lines = container.querySelectorAll('hr');
    expect(lines).toHaveLength(1);
    const hr = must(lines[0]);
    expect(hr.tagName.toLowerCase()).toBe(dividerMeta.defaultElements?.root);
    expect(hr.className).toBe(dividerAnatomy.classes.root);
    expect(hr.getAttribute('data-orientation')).toBe(orientation);
    expect(hr.getAttribute('role')).toBe(role);
    expect(hr.getAttribute('aria-orientation')).toBe(ariaOrientation);
    for (const attr of hr.getAttributeNames().filter((name) => name.startsWith('data-'))) {
      expect(dividerMeta.dataAttrs.root).toContain(attr);
    }
  });

  it('only matches a native hr', async () => {
    const { container } = await render(`<div cckDivider></div>`, { imports });
    expect(container.querySelector('.cck-divider')).toBeNull();
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<hr cckDivider #d="cckDivider" />`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckDivider)).toBeInstanceOf(CckDivider);
  });

  it('lets native attributes reach the hr and merges the class', async () => {
    const { container } = await render(
      `<hr cckDivider id="line" aria-label="Sections" class="mine" hidden data-testid="d" />`,
      { imports },
    );
    const hr = must(container.querySelector('hr'));
    expect(hr.id).toBe('line');
    expect(hr.getAttribute('aria-label')).toBe('Sections');
    expect(hr.hidden).toBe(true);
    expect(hr.getAttribute('data-testid')).toBe('d');
    expect(hr.classList.contains('mine')).toBe(true);
    expect(hr.classList.contains(dividerAnatomy.classes.root)).toBe(true);
  });

  it('follows bound inputs and removes the attributes again', async () => {
    const vertical = signal(true);
    const decorative = signal(false);
    const { container, fixture } = await render(
      `<hr cckDivider [orientation]="vertical() ? 'vertical' : 'horizontal'" [decorative]="decorative()" />`,
      { imports, componentProperties: { vertical, decorative } },
    );
    const hr = must(container.querySelector('hr'));
    expect(hr.getAttribute('aria-orientation')).toBe('vertical');
    expect(hr.hasAttribute('role')).toBe(false);
    vertical.set(false);
    decorative.set(true);
    await fixture.whenStable();
    expect(hr.getAttribute('data-orientation')).toBe('horizontal');
    expect(hr.hasAttribute('aria-orientation')).toBe(false);
    expect(hr.getAttribute('role')).toBe('none');
  });

  it('replaces a role the author writes while the divider is not decorative', async () => {
    const { container } = await render(`<hr cckDivider role="presentation" />`, { imports });
    expect(container.querySelector('hr')?.hasAttribute('role')).toBe(false);
  });

  it('puts the theme attribute on the root', async () => {
    const themeConfig = defineThemeConfig({
      name: 'test',
      components: {
        [dividerAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(dividerAnatomy.parts) },
        },
      },
    });
    const { container } = await render(`<hr cckDivider />`, { imports, providers: [provideCckTheme(themeConfig)] });
    expect(container.querySelector('.cck-divider')?.getAttribute('data-probe')).toBe('on');
  });

  describe('accessibility', () => {
    it('is a separator with its orientation', async () => {
      await render(`<hr cckDivider /><hr cckDivider orientation="vertical" />`, { imports });
      const separators = screen.getAllByRole('separator');
      expect(separators).toHaveLength(2);
      expect(separators[0]?.getAttribute('aria-orientation')).toBeNull();
      expect(separators[1]?.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('leaves the accessibility tree while decorative', async () => {
      await render(`<hr cckDivider decorative />`, { imports });
      expect(screen.queryByRole('separator')).toBeNull();
    });

    it('takes its name from aria-label', async () => {
      await render(`<hr cckDivider aria-label="Sections" />`, { imports });
      expect(screen.getByRole('separator', { name: 'Sections' })).toBeTruthy();
    });

    it.each([
      ['horizontal', `<hr cckDivider />`],
      ['vertical', `<hr cckDivider orientation="vertical" />`],
      ['decorative', `<hr cckDivider decorative />`],
    ])('has no axe violations: %s', async (_name, template) => {
      const { container } = await render(template, { imports });
      expect((await axe(container)).violations).toEqual([]);
    });

    it('is not focusable: Tab goes from the button before it to the button after it', async () => {
      await render(`<button id="a">A</button><hr cckDivider /><button id="b">B</button>`, { imports });
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement?.id).toBe('a');
      await user.tab();
      expect(document.activeElement?.id).toBe('b');
    });
  });
});
