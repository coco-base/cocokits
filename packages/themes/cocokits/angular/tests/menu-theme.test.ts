import { Component, signal, type Type } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckMenuImports } from '@cocokits/angular/menu';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckMenuItemTheme, CckMenuTheme, type CckMenuItemColor, type CckMenuSize } from '../src/index';
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

@Component({
  imports: [CckMenuImports, CckMenuTheme, CckMenuItemTheme],
  template: `
    <ng-container cckMenu>
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content size="lg">
          <cck-menu-item [color]="color()">Rename</cck-menu-item>
          <cck-menu-checkbox-item [color]="color()">Hidden</cck-menu-checkbox-item>
          <cck-menu-radio-group>
            <cck-menu-radio-item value="a" [color]="color()">A</cck-menu-radio-item>
          </cck-menu-radio-group>
          <ng-container cckMenuSub>
            <cck-menu-sub-trigger [color]="color()">Share</cck-menu-sub-trigger>
            <ng-template cckMenuPortal>
              <cck-menu-sub-content>
                <cck-menu-item>Email</cck-menu-item>
              </cck-menu-sub-content>
            </ng-template>
          </ng-container>
          <cck-menu-item color="danger">Static</cck-menu-item>
        </cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Items {
  readonly color = signal<CckMenuItemColor | null | undefined>(undefined);
}

const itemElements = (): HTMLElement[] => [
  ...document.querySelectorAll<HTMLElement>('[role=menuitem], [role=menuitemcheckbox], [role=menuitemradio]'),
];

describe('theme directive on the menu items: color', () => {
  const options = cocokitsThemeConfig.components.menu.color;

  it('has a color option on the four kinds of item that defaults to default', () => {
    expect(options.attrName).toBe('color');
    expect(options.default).toBe('default');
    expect(options.values).toEqual(['default', 'danger']);
  });

  it('renders the config default as data-color on each of the four kinds of item', async () => {
    await open(Items);
    const elements = itemElements().slice(0, 4);
    expect(elements.map((element) => element.getAttribute('role'))).toEqual([
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'menuitem',
    ]);
    for (const element of elements) expect(element.getAttribute('data-color')).toBe('default');
  });

  it('renders each value, and removes the attribute with null', async () => {
    const { fixture } = await open(Items);
    for (const value of options.values) {
      fixture.componentInstance.color.set(value);
      await fixture.whenStable();
      for (const element of itemElements().slice(0, 4)) expect(element.getAttribute('data-color')).toBe(value);
    }
    fixture.componentInstance.color.set(null);
    await fixture.whenStable();
    for (const element of itemElements().slice(0, 4)) expect(element.hasAttribute('data-color')).toBe(false);
  });

  it('keeps no option as an attribute: the item has no color, the content no size', async () => {
    const { content } = await open(Items);
    const names = itemElements().flatMap((element) => (element.hasAttribute('color') ? [element.localName] : []));
    expect(names).toEqual([]);
    expect(content.hasAttribute('size')).toBe(false);
    expect(content.hasAttribute('data-color')).toBe(false);
  });

  it('keeps the size of the content and gives the submenu content the size of the menu around it', async () => {
    const { content } = await open(Items);
    expect(content.getAttribute('data-size')).toBe('lg');
    screen.getByRole('menuitem', { name: 'Share' }).focus();
    await userEvent.setup().keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(document.querySelector('.cck-menu__sub-content')).not.toBeNull();
    });
    const sub = document.querySelector('.cck-menu__sub-content');
    expect(sub?.getAttribute('data-size')).toBe('lg');
    expect(sub?.hasAttribute('size')).toBe(false);
  });

  it('renders no theme attribute without a theme provider', async () => {
    await open(Items, { providers: [] });
    for (const element of itemElements().slice(0, 4)) expect(element.hasAttribute('data-color')).toBe(false);
  });
});

@Component({
  imports: [CckMenuImports, CckMenuTheme],
  template: `
    <ng-container cckMenu>
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content>
          <cck-menu-checkbox-item [checked]="grid"><cck-menu-item-indicator />Grid</cck-menu-checkbox-item>
          <cck-menu-checkbox-item><cck-menu-item-indicator />Rulers</cck-menu-checkbox-item>
        </cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
class Indicators {
  protected readonly grid = true;
}

describe('the item indicator of the theme', () => {
  it('carries data-state and no theme attribute, so the theme shows it from its state alone', async () => {
    await open(Indicators);
    const indicators = [...document.querySelectorAll('.cck-menu__item-indicator')];
    expect(indicators.map((indicator) => indicator.getAttribute('data-state'))).toEqual(['checked', 'unchecked']);
    for (const indicator of indicators) {
      expect(indicator.getAttributeNames().filter((name) => name.startsWith('data-') && name !== 'data-state')).toEqual(
        [],
      );
    }
  });
});
