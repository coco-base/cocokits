import { signal, type EnvironmentProviders, type Provider } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { provideCckIcons } from '@cocokits/angular-core';
import { checkIcon, heartIcon } from '@cocokits/icons';
import { svgIconAnatomy, svgIconMeta } from '@cocokits/machines/svg-icon';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckSvgIcon, CckSvgIconImports } from '../index';
import { checkSvg, testIcons } from './fixtures';

const imports = [...CckSvgIconImports];
const providers: (Provider | EnvironmentProviders)[] = [provideCckIcons({ icons: testIcons })];
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

  it('renders the root with the icon name, the owned svg with the viewBox and the body', async () => {
    const { container } = await render(`<cck-svg-icon iconName="pair" />`, { imports, providers });
    const icon = root(container);
    expect(icon.tagName).toBe('CCK-SVG-ICON');
    expect(icon.className).toBe(classes.root);
    expect(icon.getAttribute('data-icon')).toBe('pair');
    const svg = must(icon.querySelector('svg'));
    expect(svg.tagName.toLowerCase()).toBe(svgIconMeta.defaultElements?.svg);
    expect(svg.getAttribute('class')).toBe(classes.svg);
    expect(svg.getAttribute('viewBox')).toBe('0 0 10 10');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(icon.querySelectorAll('path')).toHaveLength(2);
  });

  it('writes the markup of the icon as it is, with its attributes', async () => {
    const { container } = await render(`<cck-svg-icon iconName="heart" />`, { imports, providers });
    const path = must(container.querySelector('path'));
    expect(path.getAttribute('d')).toBe(/ d="([^"]*)"/.exec(heartIcon.body)?.[1]);
    expect(path.getAttribute('fill')).toBe('currentColor');
  });

  it('is decorative without a label (or with an empty one), and an image with one', async () => {
    const { container } = await render(
      `<cck-svg-icon iconName="heart" /><cck-svg-icon iconName="heart" label="Heart" /><cck-svg-icon iconName="heart" label="" />`,
      { imports, providers },
    );
    const icons = [...container.querySelectorAll<HTMLElement>(`.${classes.root}`)];
    expect(icons).toHaveLength(3);
    const [plain, named, empty] = icons as [HTMLElement, HTMLElement, HTMLElement];
    expect(plain.getAttribute('aria-hidden')).toBe('true');
    expect(plain.hasAttribute('role')).toBe(false);
    expect(named.getAttribute('role')).toBe('img');
    expect(named.getAttribute('aria-label')).toBe('Heart');
    expect(named.hasAttribute('aria-hidden')).toBe(false);
    expect(empty.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('img', { name: 'Heart' })).toBe(named);
  });

  it('updates the drawing when the name changes', async () => {
    const iconName = signal('heart');
    const { container } = await render(`<cck-svg-icon [iconName]="iconName()" />`, {
      imports,
      providers,
      componentProperties: { iconName },
    });
    expect(root(container).getAttribute('data-icon')).toBe('heart');
    iconName.set('pair');
    await waitFor(() => {
      expect(container.querySelectorAll('path')).toHaveLength(2);
    });
    expect(root(container).getAttribute('data-icon')).toBe('pair');
  });

  it('draws the base icons without any registration', async () => {
    const { container } = await render(`<cck-svg-icon iconName="chevron-down" />`, { imports });
    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(must(container.querySelector('svg')).getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('exports the component under the exportAs name', async () => {
    const { fixture } = await render(`<cck-svg-icon iconName="heart" #icon="cckSvgIcon" />`, { imports, providers });
    expect(fixture.debugElement.children[0]?.references.icon).toBeInstanceOf(CckSvgIcon);
  });

  it('only emits data-* declared in the meta', async () => {
    const { container } = await render(`<cck-svg-icon iconName="heart" />`, { imports, providers });
    const declared: readonly string[] = svgIconMeta.dataAttrs.root;
    const names = [...root(container).attributes]
      .map((attribute) => attribute.name)
      .filter((name) => name.startsWith('data-'));
    expect(names).toEqual(['data-icon']);
    expect(names.every((name) => declared.includes(name))).toBe(true);
  });

  describe('an icon that is not registered', () => {
    it('renders an empty svg and logs one error', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { container } = await render(`<cck-svg-icon iconName="nope" />`, { imports, providers });
      await waitFor(() => {
        expect(error).toHaveBeenCalledTimes(1);
      });
      const icon = root(container);
      expect(must(icon.querySelector('svg')).hasAttribute('viewBox')).toBe(false);
      expect(icon.querySelectorAll('path')).toHaveLength(0);
      expect(icon.getAttribute('data-icon')).toBe('nope');
      expect(String(error.mock.calls[0]?.[0])).toBe(
        'CocoKits: no icon named "nope" is registered; register it with registerIcons or registerIcon.',
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
      iconName.set('heart');
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

    it('does not log for a registered icon', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      await render(`<cck-svg-icon iconName="heart" />`, { imports, providers });
      await Promise.resolve();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('a lazy icon', () => {
    it('draws after the load, with no error, and loads once for several icons', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const loader = vi.fn(() => Promise.resolve(checkIcon));
      const { container } = await render(`<cck-svg-icon iconName="lazy" /><cck-svg-icon iconName="lazy" />`, {
        imports,
        providers: [provideCckIcons({ lazyIcons: { lazy: loader } })],
      });
      await waitFor(() => {
        expect(container.querySelectorAll('path')).toHaveLength(2);
      });
      expect(loader).toHaveBeenCalledTimes(1);
      expect(error).not.toHaveBeenCalled();
    });

    it('draws an svg string that a loader returns', async () => {
      const { container } = await render(`<cck-svg-icon iconName="lazy" />`, {
        imports,
        providers: [provideCckIcons({ lazyIcons: { lazy: () => Promise.resolve(checkSvg) } })],
      });
      await waitFor(() => {
        expect(container.querySelectorAll('path')).toHaveLength(1);
      });
      expect(must(container.querySelector('svg')).getAttribute('viewBox')).toBe(checkIcon.viewBox);
    });
  });

  describe('the svg input', () => {
    it('draws a full svg string after mount, without data-icon', async () => {
      const { container } = await render(`<cck-svg-icon [svg]="svg" />`, {
        imports,
        componentProperties: { svg: checkSvg },
      });
      await waitFor(() => {
        expect(container.querySelectorAll('path')).toHaveLength(1);
      });
      const icon = root(container);
      expect(icon.hasAttribute('data-icon')).toBe(false);
      expect(must(icon.querySelector('svg')).getAttribute('viewBox')).toBe(checkIcon.viewBox);
    });

    it('draws an empty svg and logs an error for markup that is not an svg', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { container } = await render(`<cck-svg-icon [svg]="svg" />`, {
        imports,
        componentProperties: { svg: '<p>no</p>' },
      });
      await waitFor(() => {
        expect(error).toHaveBeenCalledTimes(1);
      });
      expect(container.querySelectorAll('path')).toHaveLength(0);
      expect(String(error.mock.calls[0]?.[0])).toContain('svg is not an <svg> element');
    });

    it('uses iconName and logs an error when both are given', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { container } = await render(`<cck-svg-icon iconName="pair" [svg]="svg" />`, {
        imports,
        providers,
        componentProperties: { svg: checkSvg },
      });
      await waitFor(() => {
        expect(error).toHaveBeenCalledTimes(1);
      });
      expect(container.querySelectorAll('path')).toHaveLength(2);
      expect(String(error.mock.calls[0]?.[0])).toContain('not both');
    });
  });

  it('draws an empty svg and logs an error when neither input is given', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { container } = await render(`<cck-svg-icon />`, { imports, providers });
    await waitFor(() => {
      expect(error).toHaveBeenCalledTimes(1);
    });
    expect(String(error.mock.calls[0]?.[0])).toBe('CocoKits: give iconName or svg.');
    expect(must(container.querySelector('svg')).hasAttribute('viewBox')).toBe(false);
  });
});
