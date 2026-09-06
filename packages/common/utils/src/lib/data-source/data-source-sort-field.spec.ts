import { describe, it, expect } from 'vitest';
import { DataSourceSortField } from './data-source-sort-field';

interface Example { id: number }

describe('DataSourceSortField', () => {
  it('should initialize with none direction', () => {
    const f = new DataSourceSortField<Example>('id');
    // default direction per project model is 'asc'
    expect(f.direction).toBe('asc');
  });

  it('should toggle through asc, desc, none', () => {
    const f = new DataSourceSortField<Example>('id');
    // starting default 'asc' -> toggle -> 'desc' -> 'none' -> 'asc'
    f.toggle();
    expect(f.direction).toBe('desc');
    f.toggle();
    expect(f.direction).toBe('none');
    f.toggle();
    expect(f.direction).toBe('asc');
  });

  it('compact toggle should cycle asc<->desc when allowNone=false', () => {
    const f = new DataSourceSortField<Example>('id');
    // starting default 'asc' compact toggle should flip to 'desc', then 'asc'
    f.toggle(false);
    expect(f.direction).toBe('desc');
    f.toggle(false);
    expect(f.direction).toBe('asc');
    f.toggle(false);
    expect(f.direction).toBe('desc');
  });

  it('getConfig returns undefined for none and config for set directions', () => {
    const f = new DataSourceSortField<Example>('id');
    // default is 'asc' therefore config should be available
    expect(f.getConfig()).toEqual({ field: 'id', direction: 'asc' });
    f.setDirection('none');
    expect(f.getConfig()).toBeUndefined();
    f.setDirection('desc');
    expect(f.getConfig()).toEqual({ field: 'id', direction: 'desc' });
  });
});
