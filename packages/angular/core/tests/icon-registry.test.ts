import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen, waitFor } from '@testing-library/angular';
import { baseIcons, checkIcon, searchIcon } from '@cocokits/icons';
import { defineThemeConfig } from '@cocokits/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CckIconRegistry, injectPartIconName, provideCckIcons, provideCckTheme } from '../src/index';

const themed = defineThemeConfig({
  name: 'test',
  components: { select: { icons: { dropdownIcon: 'search' } } },
});

@Component({ selector: 'test-reader', template: `<i data-testid="out">{{ name() }}</i>` })
class Reader {
  protected readonly name = injectPartIconName('select', 'dropdownIcon');
}

describe('CckIconRegistry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with the base icons', () => {
    const registry = TestBed.inject(CckIconRegistry);
    for (const [name, icon] of Object.entries(baseIcons)) expect(registry.get(name)).toBe(icon);
    expect(registry.has('search')).toBe(false);
  });

  it('is one registry per application and registers later icons', () => {
    const registry = TestBed.inject(CckIconRegistry);
    expect(TestBed.inject(CckIconRegistry)).toBe(registry);
    const before = registry.changes();
    registry.registerIcons({ search: searchIcon });
    expect(registry.get('search')).toBe(searchIcon);
    expect(registry.changes()).toBeGreaterThan(before);
  });

  it('shares one lazy load', async () => {
    const registry = TestBed.inject(CckIconRegistry);
    const loader = vi.fn(() => Promise.resolve(checkIcon));
    registry.registerIcon('lazy', loader);
    expect(registry.has('lazy')).toBe(true);
    expect(registry.get('lazy')).toBeUndefined();
    const [first, second] = await Promise.all([registry.load('lazy'), registry.load('lazy')]);
    expect(first).toBe(checkIcon);
    expect(second).toBe(checkIcon);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('provideCckIcons registers eager and lazy icons at start', () => {
    TestBed.configureTestingModule({
      providers: [
        provideCckIcons({ icons: { search: searchIcon }, lazyIcons: { lazy: () => Promise.resolve(checkIcon) } }),
      ],
    });
    const registry = TestBed.inject(CckIconRegistry);
    expect(registry.get('search')).toBe(searchIcon);
    expect(registry.has('lazy')).toBe(true);
  });

  it('provideCckIcons without options registers nothing', () => {
    TestBed.configureTestingModule({ providers: [provideCckIcons()] });
    expect(TestBed.inject(CckIconRegistry).has('search')).toBe(false);
  });

  it('can be injected in a component', async () => {
    @Component({ selector: 'test-user', template: '' })
    class User {
      readonly registry = inject(CckIconRegistry);
    }
    const { fixture } = await render(User);
    expect(fixture.componentInstance.registry.has('check')).toBe(true);
  });
});

describe('injectPartIconName', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gives the default without a theme', async () => {
    await render(Reader);
    expect(screen.getByTestId('out').textContent).toBe('chevron-down');
  });

  it('gives the default for a theme without icons', async () => {
    await render(Reader, { providers: [provideCckTheme(defineThemeConfig({ name: 'bare', components: {} }))] });
    expect(screen.getByTestId('out').textContent).toBe('chevron-down');
  });

  it('gives the icon the theme names when it is registered', async () => {
    await render(Reader, {
      providers: [provideCckTheme(themed), provideCckIcons({ icons: { search: searchIcon } })],
    });
    expect(screen.getByTestId('out').textContent).toBe('search');
  });

  it('gives a lazily registered name', async () => {
    await render(Reader, {
      providers: [
        provideCckTheme(themed),
        provideCckIcons({ lazyIcons: { search: () => Promise.resolve(searchIcon) } }),
      ],
    });
    expect(screen.getByTestId('out').textContent).toBe('search');
  });

  it('falls back to the default and logs one error for a name that is not registered', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await render(Reader, { providers: [provideCckTheme(themed)] });
    expect(screen.getByTestId('out').textContent).toBe('chevron-down');
    await waitFor(() => {
      expect(error).toHaveBeenCalledTimes(1);
    });
    expect(String(error.mock.calls[0]?.[0])).toContain('"search" for select.dropdownIcon');
  });

  it('switches to the theme icon when it is registered later', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { fixture } = await render(Reader, { providers: [provideCckTheme(themed)] });
    expect(screen.getByTestId('out').textContent).toBe('chevron-down');
    TestBed.inject(CckIconRegistry).registerIcons({ search: searchIcon });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(screen.getByTestId('out').textContent).toBe('search');
  });
});
