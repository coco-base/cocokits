// @vitest-environment jsdom
import { searchIcon } from '@cocokits/icons';
import { describe, expect, it, vi } from 'vitest';
import { createIconRegistry, createReadOnlyIconRegistry } from '../index';

describe('read-only icon registry', () => {
  it('reads, loads and subscribes through the wrapped registry', async () => {
    const inner = createIconRegistry();
    const readOnly = createReadOnlyIconRegistry(inner, vi.fn());
    const listener = vi.fn();
    readOnly.subscribe(listener);
    inner.registerIcon('lazy', () => Promise.resolve(searchIcon));
    expect(readOnly.has('lazy')).toBe(true);
    expect(readOnly.get('lazy')).toBeUndefined();
    expect(await readOnly.load('lazy')).toBe(searchIcon);
    expect(readOnly.get('lazy')).toBe(searchIcon);
    expect(listener).toHaveBeenCalled();
  });

  it('calls onWrite and registers nothing on a write', () => {
    const onWrite = vi.fn();
    const inner = createIconRegistry();
    const readOnly = createReadOnlyIconRegistry(inner, onWrite);
    readOnly.registerIcons({ search: searchIcon });
    readOnly.registerIcon('lazy', () => Promise.resolve(searchIcon));
    expect(onWrite).toHaveBeenCalledTimes(2);
    expect(inner.has('search')).toBe(false);
    expect(inner.has('lazy')).toBe(false);
  });

  it('ignores destroy', () => {
    const inner = createIconRegistry();
    const listener = vi.fn();
    inner.subscribe(listener);
    createReadOnlyIconRegistry(inner, vi.fn()).destroy();
    inner.registerIcons({ search: searchIcon });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
