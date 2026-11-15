import { Component, signal, type Type } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckMenuImports } from '@cocokits/angular/menu';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuTheme, type CckMenuSize } from '../src/index';
import { providers } from './helpers';

@Component({
  imports: [CckMenuImports, CckMenuTheme],
  template: `
    <ng-container cckMenu>
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content [size]="size()">
          <cck-menu-item>Rename</cck-menu-item>
          <cck-menu-item [disabled]="true">Move</cck-menu-item>
        </cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Host {
  readonly size = signal<CckMenuSize | null | undefined>(undefined);
}

@Component({
  imports: [CckMenuImports, CckMenuTheme],
  template: `
    <ng-container cckMenu>
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content size="sm"
          ><cck-menu-item>{{ label }}</cck-menu-item></cck-menu-content
        >
      </ng-template>
    </ng-container>
  `,
})
class Fixed {
  protected readonly label = 'Rename';
}

const themed = { providers };

beforeEach(() => {
  HTMLElement.prototype.showPopover = function (this: HTMLElement) {
    this.style.display = 'block';
  };
  HTMLElement.prototype.hidePopover = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  vi.restoreAllMocks();
});

async function open<T>(component: Type<T>, config = themed) {
  const view = await render(component, config);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Actions' }));
  await view.fixture.whenStable();
  const content = document.querySelector('.cck-menu__content');
  if (!content) throw new Error('no .cck-menu__content');
  return { ...view, content };
}

describe('theme directive on the menu content', () => {
  it('renders the config default on the content, on no other part', async () => {
    const { content } = await open(Host);
    expect(content.getAttribute('data-size')).toBe('md');
    expect(document.querySelectorAll('[data-size]')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Actions' }).hasAttribute('data-size')).toBe(false);
  });

  it('renders data-size for every value', async () => {
    const { content, fixture } = await open(Host);
    for (const value of cocokitsThemeConfig.components.menu.size.values) {
      fixture.componentInstance.size.set(value);
      await fixture.whenStable();
      expect(content.getAttribute('data-size')).toBe(value);
    }
  });

  it('removes the attribute with null and restores the default with undefined', async () => {
    const { content, fixture } = await open(Host);
    fixture.componentInstance.size.set(null);
    await fixture.whenStable();
    expect(content.hasAttribute('data-size')).toBe(false);
    fixture.componentInstance.size.set(undefined);
    await fixture.whenStable();
    expect(content.getAttribute('data-size')).toBe('md');
  });

  const overrides = { providers: [...providers, provideCckTheme(cocokitsThemeConfig, { menu: { size: 'lg' } })] };

  it('lets a provider override win over the default, and the own input over the override', async () => {
    expect((await open(Host, overrides)).content.getAttribute('data-size')).toBe('lg');
  });

  it('lets the own input win over a provider override', async () => {
    expect((await open(Fixed, overrides)).content.getAttribute('data-size')).toBe('sm');
  });

  it('keeps the base behaviour under the theme: the menu role and the items', async () => {
    const { content } = await open(Host);
    expect(content.getAttribute('role')).toBe('menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('renders no theme data-* without a theme provider', async () => {
    const { content } = await open(Host, { providers: [] });
    expect(content.hasAttribute('data-size')).toBe(false);
  });
});
