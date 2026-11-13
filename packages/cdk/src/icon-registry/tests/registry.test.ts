// @vitest-environment jsdom
import { baseIcons, checkIcon, searchIcon, type Icon } from '@cocokits/icons';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createIconRegistry } from '../index';

const svgOf = (icon: Icon): string => `<svg viewBox="${icon.viewBox}">${icon.body}</svg>`;

function deferred<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (reason: Error) => void } {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('icon registry: eager icons', () => {
  it('starts with the base icons', () => {
    const registry = createIconRegistry();
    for (const [name, icon] of Object.entries(baseIcons)) {
      expect(registry.has(name)).toBe(true);
      expect(registry.get(name)).toBe(icon);
    }
    expect(registry.has('search')).toBe(false);
    expect(registry.get('search')).toBeUndefined();
  });

  it('reads a registered icon and replaces it when registered again', () => {
    const registry = createIconRegistry();
    registry.registerIcons({ search: searchIcon });
    expect(registry.get('search')).toBe(searchIcon);
    registry.registerIcons({ search: checkIcon });
    expect(registry.get('search')).toBe(checkIcon);
  });

  it('falls back to the parent and prefers its own icon', () => {
    const parent = createIconRegistry();
    parent.registerIcons({ search: searchIcon });
    const child = createIconRegistry(parent);
    expect(child.has('search')).toBe(true);
    expect(child.get('search')).toBe(searchIcon);
    child.registerIcons({ search: checkIcon });
    expect(child.get('search')).toBe(checkIcon);
    expect(parent.get('search')).toBe(searchIcon);
  });

  it('notifies on a register and stops after unsubscribe or destroy', () => {
    const registry = createIconRegistry();
    const listener = vi.fn();
    const stop = registry.subscribe(listener);
    registry.registerIcons({ search: searchIcon });
    registry.registerIcon('logo', () => Promise.resolve(checkIcon));
    expect(listener).toHaveBeenCalledTimes(2);
    stop();
    registry.registerIcons({ search: checkIcon });
    expect(listener).toHaveBeenCalledTimes(2);
    const other = vi.fn();
    registry.subscribe(other);
    registry.destroy();
    registry.registerIcons({ search: searchIcon });
    expect(other).not.toHaveBeenCalled();
  });
});

describe('icon registry: lazy icons', () => {
  it('has a lazy name but does not get it before it loads', () => {
    const registry = createIconRegistry();
    registry.registerIcon('logo', () => Promise.resolve(searchIcon));
    expect(registry.has('logo')).toBe(true);
    expect(registry.get('logo')).toBeUndefined();
  });

  it('calls the loader once for concurrent loads, shares the result and notifies once it finished', async () => {
    const registry = createIconRegistry();
    const pending = deferred<Icon>();
    const loader = vi.fn(() => pending.promise);
    registry.registerIcon('logo', loader);
    const listener = vi.fn();
    registry.subscribe(listener);
    const first = registry.load('logo');
    const second = registry.load('logo');
    const third = registry.load('logo');
    expect(loader).toHaveBeenCalledTimes(1);
    pending.resolve(searchIcon);
    expect(await Promise.all([first, second, third])).toEqual([searchIcon, searchIcon, searchIcon]);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(registry.get('logo')).toBe(searchIcon);
    expect(await registry.load('logo')).toBe(searchIcon);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('turns a string result into an icon once', async () => {
    const registry = createIconRegistry();
    const loader = vi.fn(() => Promise.resolve(svgOf(searchIcon)));
    registry.registerIcon('logo', loader);
    const icon = await registry.load('logo');
    expect(icon?.viewBox).toBe(searchIcon.viewBox);
    expect(icon?.body.length).toBeGreaterThan(0);
    expect(await registry.load('logo')).toBe(icon);
    expect(registry.get('logo')).toBe(icon);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('caches a failed load, logs one error and allows a new load after a register', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const registry = createIconRegistry();
    const loader = vi.fn(() => Promise.reject(new Error('offline')));
    registry.registerIcon('logo', loader);
    expect(await registry.load('logo')).toBeUndefined();
    expect(await registry.load('logo')).toBeUndefined();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0])).toMatch(/^CocoKits:/);
    registry.registerIcon('logo', () => Promise.resolve(searchIcon));
    expect(await registry.load('logo')).toBe(searchIcon);
  });

  it('treats a string that is not an svg as a failed load', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const registry = createIconRegistry();
    const loader = vi.fn(() => Promise.resolve('<p>no</p>'));
    registry.registerIcon('logo', loader);
    expect(await registry.load('logo')).toBeUndefined();
    expect(await registry.load('logo')).toBeUndefined();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('ignores a load that a register replaced while it ran', async () => {
    const registry = createIconRegistry();
    const pending = deferred<Icon>();
    registry.registerIcon('logo', () => pending.promise);
    const stale = registry.load('logo');
    registry.registerIcons({ logo: checkIcon });
    pending.resolve(searchIcon);
    await stale;
    expect(registry.get('logo')).toBe(checkIcon);
  });

  it('loads through the parent and resolves undefined for an unknown name', async () => {
    const parent = createIconRegistry();
    parent.registerIcon('logo', () => Promise.resolve(searchIcon));
    const child = createIconRegistry(parent);
    expect(await child.load('logo')).toBe(searchIcon);
    expect(await child.load('missing')).toBeUndefined();
  });

  it('stores nothing after destroy', async () => {
    const registry = createIconRegistry();
    const pending = deferred<Icon>();
    registry.registerIcon('logo', () => pending.promise);
    const result = registry.load('logo');
    registry.destroy();
    pending.resolve(searchIcon);
    await result;
    expect(registry.get('logo')).toBeUndefined();
  });
});

describe('icon registry: parent changes', () => {
  it('fires a child listener on a parent register and on a finished parent load, until unsubscribed', async () => {
    const parent = createIconRegistry();
    const child = createIconRegistry(parent);
    const listener = vi.fn();
    const stop = child.subscribe(listener);
    parent.registerIcons({ search: searchIcon });
    expect(listener).toHaveBeenCalledTimes(1);
    parent.registerIcon('lazy', () => Promise.resolve(checkIcon));
    expect(listener).toHaveBeenCalledTimes(2);
    await child.load('lazy');
    expect(listener).toHaveBeenCalledTimes(3);
    stop();
    parent.registerIcons({ other: searchIcon });
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
