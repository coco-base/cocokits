import { Component, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckSelectImports } from '@cocokits/angular/select';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckSelectTheme, type CckSelectSize } from '../src/index';

@Component({
  imports: [CckSelectImports, CckSelectTheme],
  template: `
    <div cckSelect aria-label="Dish" placeholder="Choose a dish" [size]="size()">
      <div cckSelectOption value="Cake">Cake</div>
      <div cckSelectOption value="Pizza">Pizza</div>
    </div>
  `,
})
class Host {
  readonly size = signal<CckSelectSize | null | undefined>(undefined);
}

@Component({
  imports: [CckSelectImports, CckSelectTheme],
  template: `
    <div cckSelect aria-label="Dish" size="sm">
      <div cckSelectOption [value]="dish">Cake</div>
    </div>
  `,
})
class Fixed {
  protected readonly dish = 'Cake';
}

const themed = { providers: [provideCckTheme(cocokitsThemeConfig)] };
const root = (container: Element): Element => {
  const element = container.querySelector('.cck-select');
  if (!element) throw new Error('no .cck-select');
  return element;
};

describe('theme directive on the select', () => {
  it('renders the config default on the host root', async () => {
    const { container } = await render(Host, themed);
    expect(root(container).getAttribute('data-size')).toBe('md');
  });

  it('renders data-size for every value, on the root only', async () => {
    const { container, fixture } = await render(Host, themed);
    for (const value of cocokitsThemeConfig.components.select.size.values) {
      fixture.componentInstance.size.set(value);
      await fixture.whenStable();
      expect(root(container).getAttribute('data-size')).toBe(value);
      expect(container.querySelectorAll('[data-size]')).toHaveLength(1);
    }
  });

  it('removes the attribute with null and restores the default with undefined', async () => {
    const { container, fixture } = await render(Host, themed);
    fixture.componentInstance.size.set(null);
    await fixture.whenStable();
    expect(root(container).hasAttribute('data-size')).toBe(false);
    fixture.componentInstance.size.set(undefined);
    await fixture.whenStable();
    expect(root(container).getAttribute('data-size')).toBe('md');
  });

  const overrides = { providers: [provideCckTheme(cocokitsThemeConfig, { select: { size: 'lg' } })] };

  it('lets a provider override win over the config default', async () => {
    const { container } = await render(Host, overrides);
    expect(root(container).getAttribute('data-size')).toBe('lg');
  });

  it('lets the own input win over a provider override', async () => {
    const { container } = await render(Fixed, overrides);
    expect(root(container).getAttribute('data-size')).toBe('sm');
  });

  it('keeps the base behaviour under the theme: the combobox and its placeholder', async () => {
    await render(Host, themed);
    const trigger = screen.getByRole('combobox');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.textContent).toContain('Choose a dish');
    expect(trigger.hasAttribute('data-size')).toBe(false);
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { container } = await render(Host);
    expect(root(container).hasAttribute('data-size')).toBe(false);
  });
});
