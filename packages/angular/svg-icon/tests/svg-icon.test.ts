import { signal, type Provider } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { provideCckTheme } from '@cocokits/angular-core';
import { svgIconAnatomy, svgIconMeta } from '@cocokits/machines/svg-icon';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckSvgIcon, CckSvgIconImports } from '../index';
import { testIcons, testThemeConfig } from './fixtures';

const imports = [...CckSvgIconImports];
const providers: Provider[] = [provideCckTheme(testThemeConfig)];
const { classes } = svgIconAnatomy;

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

const root = (container: Element): HTMLElement => must(container.querySelector<HTMLElement>(`.${classes.root}`));

describe('CckSvgIcon', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the root with the icon name, the svg with the viewBox and one path per icon path', async () => {
    const { container } = await render(`<cck-svg-icon iconName="pair" />`, { imports, providers });
    const icon = root(container);
    expect(icon.tagName).toBe('CCK-SVG-ICON');
    expect(icon.className).toBe(classes.root);
    expect(icon.getAttribute('data-icon-name')).toBe('pair');
    const svg = must(icon.querySelector('svg'));
    expect(svg.getAttribute('class')).toBe(classes.svg);
    expect(svg.getAttribute('viewBox')).toBe('0 0 10 10');
    const paths = [...icon.querySelectorAll('path')];
    expect(paths.map((path) => path.getAttribute('d'))).toEqual(['M0 0h5', 'M5 5h5']);
    expect(paths.every((path) => !path.hasAttribute('fill-rule') && !path.hasAttribute('clip-rule'))).toBe(true);
  });

  it('writes the fill-rule and clip-rule of a path that has them', async () => {
    const { container } = await render(`<cck-svg-icon iconName="star" />`, { imports, providers });
    const path = must(container.querySelector('path'));
    expect(path.getAttribute('fill-rule')).toBe('evenodd');
    expect(path.getAttribute('clip-rule')).toBe('evenodd');
  });

  it('is decorative without a label (or with an empty one), and an image with one', async () => {
    const { container } = await render(
      `<cck-svg-icon iconName="star" /><cck-svg-icon iconName="star" label="Star" /><cck-svg-icon iconName="star" label="" />`,
      { imports, providers },
    );
    const icons = [...container.querySelectorAll<HTMLElement>(`.${classes.root}`)];
    expect(icons).toHaveLength(3);
    const [plain, named, empty] = icons as [HTMLElement, HTMLElement, HTMLElement];
    expect(plain.getAttribute('aria-hidden')).toBe('true');
    expect(plain.hasAttribute('role')).toBe(false);
    expect(named.getAttribute('role')).toBe('img');
    expect(named.getAttribute('aria-label')).toBe('Star');
    expect(named.hasAttribute('aria-hidden')).toBe(false);
    expect(empty.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('img', { name: 'Star' })).toBe(named);
  });

  it('updates the drawing when the name changes', async () => {
    const iconName = signal('star');
    const { container } = await render(`<cck-svg-icon [iconName]="iconName()" />`, {
      imports,
      providers,
      componentProperties: { iconName },
    });
    expect(root(container).getAttribute('data-icon-name')).toBe('star');
    iconName.set('pair');
    await waitFor(() => {
      expect(container.querySelectorAll('path')).toHaveLength(2);
    });
    expect(root(container).getAttribute('data-icon-name')).toBe('pair');
  });

  it('exports the component under the exportAs name', async () => {
    const { fixture } = await render(`<cck-svg-icon iconName="star" #icon="cckSvgIcon" />`, { imports, providers });
    expect(fixture.debugElement.children[0]?.references.icon).toBeInstanceOf(CckSvgIcon);
  });

  it('only emits data-* declared in the meta', async () => {
    const { container } = await render(`<cck-svg-icon iconName="star" />`, { imports, providers });
    const declared: readonly string[] = svgIconMeta.dataAttrs.root;
    const names = [...root(container).attributes]
      .map((attribute) => attribute.name)
      .filter((name) => name.startsWith('data-'));
    expect(names).toEqual(['data-icon-name']);
    expect(names.every((name) => declared.includes(name))).toBe(true);
  });

  describe('an icon that is not found', () => {
    it.each([
      ['an unknown name', 'nope', providers],
      ['no theme', 'star', []],
      ['a prototype member name', 'constructor', providers],
    ])('renders an empty svg and logs one error: %s', async (_name, iconName, extra) => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { container } = await render(`<cck-svg-icon iconName="${iconName}" />`, { imports, providers: extra });
      await waitFor(() => {
        expect(error).toHaveBeenCalledTimes(1);
      });
      const icon = root(container);
      expect(must(icon.querySelector('svg')).hasAttribute('viewBox')).toBe(false);
      expect(icon.querySelectorAll('path')).toHaveLength(0);
      expect(icon.getAttribute('data-icon-name')).toBe(iconName);
      expect(String(error.mock.calls[0]?.[0])).toBe(
        `CocoKits: the theme has no icon named "${iconName}". Add it to ThemeConfig.icons.`,
      );
    });

    it('logs again for another unknown name, and not for a known one', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const iconName = signal('nope');
      const { container } = await render(`<cck-svg-icon [iconName]="iconName()" />`, {
        imports,
        providers,
        componentProperties: { iconName },
      });
      await waitFor(() => {
        expect(error).toHaveBeenCalledTimes(1);
      });
      iconName.set('star');
      await waitFor(() => {
        expect(container.querySelectorAll('path')).toHaveLength(1);
      });
      expect(error).toHaveBeenCalledTimes(1);
      iconName.set('nope-2');
      await waitFor(() => {
        expect(error).toHaveBeenCalledTimes(2);
      });
      expect(String(error.mock.calls[1]?.[0])).toContain('"nope-2"');
    });

    it('does not log for a found icon', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await render(`<cck-svg-icon iconName="star" />`, { imports, providers });
      await Promise.resolve();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('safety', () => {
    it('renders an icon whose d holds markup as attribute text: only svg and path, no script', async () => {
      const { container } = await render(`<cck-svg-icon iconName="attack" />`, { imports, providers });
      const icon = root(container);
      expect(icon.querySelector('script')).toBeNull();
      const tags = [...icon.querySelectorAll('*')].map((element) => element.tagName.toLowerCase());
      expect(tags).toEqual(['svg', 'path']);
      const path = must(icon.querySelector('path'));
      expect(path.getAttribute('d')).toBe(testIcons.attack.paths[0].d);
      expect(path.getAttributeNames()).toEqual(['d']);
    });
  });
});
