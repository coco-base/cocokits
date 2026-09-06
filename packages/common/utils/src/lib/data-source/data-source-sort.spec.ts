import { describe, it, expect } from 'vitest';
import { DataSourceSort } from './data-source-sort';

interface Example {
  id: number;
  name: string;
  age?: number | null;
  created?: Date | null;
  active?: boolean;
}

const rows: Example[] = [
  { id: 1, name: 'John', age: 35, created: new Date('2021-01-01'), active: true },
  { id: 2, name: 'Alice', age: 28, created: new Date('2020-05-03'), active: false },
  { id: 3, name: 'Bob', age: null, created: new Date('2022-07-07'), active: true },
  { id: 4, name: 'Zack', age: 28, created: null, active: false },
];

describe('DataSourceSort', () => {
  it('should sort ascending by single field', () => {
    const s = new DataSourceSort<Example>();
    s.set('name', 'asc');
    const out = s.apply(rows);
    expect(out.map(r => r.name)).toEqual(['Alice', 'Bob', 'John', 'Zack']);
  });

  it('should sort descending by single field', () => {
    const s = new DataSourceSort<Example>();
    s.set('age', 'desc');
    const out = s.apply(rows);
    expect(out.map(r => r.id)).toEqual([1, 2, 4, 3]); // null age last
  });

  it('should support multi-sort with priority', () => {
    const s = new DataSourceSort<Example>();
    s.add('age', 'asc', 2);
    s.add('name', 'desc', 1); // higher priority
    const out = s.apply(rows);
    // name desc first priority, then age asc -> Zack, John, Bob, Alice
    expect(out.map(r => r.id)).toEqual([4, 1, 3, 2]);
  });

  it('should toggle sort: none -> asc -> desc -> remove', () => {
    const s = new DataSourceSort<Example>();
    // toggle should not add when missing (class-level behavior) - use toggleOrAdd to add
    s.toggleOrAdd('name');
  expect(s.getSortConfigs().length).toBe(1);
  expect(s.getSortConfigs()[0].direction).toBe('asc');

    s.toggle('name');
  expect(s.getSortConfigs()[0].direction).toBe('desc');

    s.toggle('name');
  expect(s.getSortConfigs().length).toBe(0);
  });

  it('should remove specific sort and clear all sorts', () => {
    const s = new DataSourceSort<Example>();
    s.set('name', 'asc');
    s.add('age', 'desc');
    expect(s.getSortConfigs().length).toBe(2);
    s.remove('age');
    expect(s.getSortConfigs().length).toBe(1);
    s.clearAll();
    expect(s.getSortConfigs().length).toBe(0);
  });

  it('should handle different types and nulls correctly', () => {
    const s = new DataSourceSort<Example>();
    s.set('created', 'asc');
    const out = s.apply(rows);
    // null created should be first (treated as empty -> less than)
    expect(out.map(r => r.id)).toEqual([4, 2, 1, 3]);
  });

});
