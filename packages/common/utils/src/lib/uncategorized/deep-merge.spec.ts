import { describe, expect, it } from 'vitest';

import { deepMerge, deepMergeDefaultCustomize, deepMergeWithIdCustomizer } from './deep-merge';

// deepMerge Function Scenarios
describe('deepMerge', () => {
  it('should deeply merge two plain objects without arrays', () => {
    const target = { a: 1, b: { c: 2 } };
    const source = { b: { d: 3 }, e: 4 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  it('should merge arrays without duplication using the default customizer', () => {
    const target = { a: [1, 2] };
    const source = { a: [2, 3] };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: [1, 2, 3] });
  });

  it('should use the provided customizer to merge arrays when passed', () => {
    const customizer = (obj: unknown, src: unknown) => {
      if (Array.isArray(obj) && Array.isArray(src)) {
        return obj.concat(src).map((value) => value * 2);
      }

      return;
    };
    const target = { a: [1] };
    const source = { a: [2] };
    const result = deepMerge(target, source, customizer);
    expect(result).toEqual({ a: [2, 4] });
  });

  it('should return a deeply merged object when target has nested objects', () => {
    const target = { a: { b: { c: 1 } } };
    const source = { a: { b: { d: 2 } } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
  });

  it('should return a deeply merged object when source has nested objects', () => {
    const target = { a: 1 };
    const source = { b: { c: { d: 2 } } };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: { c: { d: 2 } } });
  });

  it('should merge two objects with different sets of keys', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should overwrite the properties in target if the same key exists in source', () => {
    const target = { a: 1 };
    const source = { a: 2 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 2 });
  });

  it('should keep non-overlapping keys in the target unchanged', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1, b: 3 });
  });

  it('should deeply merge arrays and objects at various levels of nesting', () => {
    const target = { a: [{ b: 1 }] };
    const source = { a: [{ c: 2 }] };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: [{ b: 1 }, { c: 2 }] });
  });

  it('should not mutate the original target or source objects', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    const targetClone = { ...target };
    const sourceClone = { ...source };
    deepMerge(target, source);
    expect(target).toEqual(targetClone);
    expect(source).toEqual(sourceClone);
  });

  it('should handle merging when target and source are both empty objects', () => {
    const target = {};
    const source = {};
    const result = deepMerge(target, source);
    expect(result).toEqual({});
  });

  it('should handle merging when target is empty but source has data', () => {
    const target = {};
    const source = { a: 1 };
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1 });
  });

  it('should handle merging when source is empty but target has data', () => {
    const target = { a: 1 };
    const source = {};
    const result = deepMerge(target, source);
    expect(result).toEqual({ a: 1 });
  });

  it('should return target if source is undefined or null', () => {
    const target = { a: 1 };
    const resultUndefined = deepMerge(target, undefined);
    const resultNull = deepMerge(target, null);
    expect(resultUndefined).toEqual(target);
    expect(resultNull).toEqual(target);
  });

  it('should return source if target is undefined or null', () => {
    const source = { a: 1 };
    const resultUndefined = deepMerge(undefined, source);
    const resultNull = deepMerge(null, source);
    expect(resultUndefined).toEqual(source);
    expect(resultNull).toEqual(source);
  });
});

// deepMergeDefaultCustomize Function Scenarios
describe('deepMergeDefaultCustomize', () => {
  it('should merge two arrays by combining unique elements', () => {
    const target = [1, 2];
    const source = [2, 3];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should preserve the order of elements from both target and source arrays', () => {
    const target = [1, 2];
    const source = [3, 4];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('should return the original array when target and source arrays are identical', () => {
    const target = [1, 2];
    const source = [1, 2];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 2]);
  });

  it('should handle empty arrays in the target and source correctly', () => {
    const target: any[] = [];
    const source: any[] = [];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([]);
  });

  it('should merge arrays when target is empty but source has elements', () => {
    const target: any[] = [];
    const source = [1, 2];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 2]);
  });

  it('should merge arrays when source is empty but target has elements', () => {
    const target = [1, 2];
    const source: any[] = [];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 2]);
  });

  it('should merge arrays with different types of elements', () => {
    const target = [1, 'a'];
    const source = ['b', 2];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 'a', 'b', 2]);
  });

  it('should return undefined for non-array types (if one or both are not arrays)', () => {
    const target = { a: 1 };
    const source = [1, 2];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toBeUndefined();
  });

  it('should merge arrays with complex objects, keeping objects intact', () => {
    const target = [{ a: 1 }];
    const source = [{ b: 2 }];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('should handle arrays of different lengths correctly', () => {
    const target = [1];
    const source = [2, 3];
    const result = deepMergeDefaultCustomize(target, source);
    expect(result).toEqual([1, 2, 3]);
  });
});

// deepMergeWithIdCustomizer Function Scenarios
describe('deepMergeWithIdCustomizer', () => {
  it('should merge two arrays of objects based on id property', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 1, age: 30 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, name: 'John', age: 30 }]);
  });

  it('should merge objects with matching id and combine their properties', () => {
    const target = [{ id: 1, a: 1 }];
    const source = [{ id: 1, b: 2 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, a: 1, b: 2 }]);
  });

  it('should add new objects from the source array if no matching id is found in the target', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 2, age: 30 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, age: 30 },
    ]);
  });

  it('should keep target objects unchanged when no matching id is found in the source', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 2, age: 30 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, age: 30 },
    ]);
  });

  it('should handle merging when target array is empty and source has objects with id', () => {
    const target: any[] = [];
    const source = [{ id: 1, name: 'John' }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, name: 'John' }]);
  });

  it('should handle merging when source array is empty and target has objects with id', () => {
    const target = [{ id: 1, name: 'John' }];
    const source: any[] = [];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, name: 'John' }]);
  });

  it('should overwrite non-object properties in target with source values', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 1, name: 'Doe' }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, name: 'Doe' }]);
  });

  it('should preserve the original array structure when no id matching is found', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 2, age: 30 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([
      { id: 1, name: 'John' },
      { id: 2, age: 30 },
    ]);
  });

  it('should merge nested arrays of objects based on id', () => {
    const target = [{ id: 1, items: [{ id: 10, value: 'a' }] }];
    const source = [{ id: 1, items: [{ id: 10, value: 'b' }] }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, items: [{ id: 10, value: 'b' }] }]);
  });

  it('should handle objects with no id property by adding them from source', () => {
    const target = [{ name: 'John' }];
    const source = [{ age: 30 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ name: 'John' }, { age: 30 }]);
  });

  it('should not mutate the original target or source arrays', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 1, age: 30 }];
    const targetClone = JSON.parse(JSON.stringify(target));
    const sourceClone = JSON.parse(JSON.stringify(source));
    deepMergeWithIdCustomizer(target, source);
    expect(target).toEqual(targetClone);
    expect(source).toEqual(sourceClone);
  });

  it('should handle cases where target and source arrays are identical', () => {
    const target = [{ id: 1, name: 'John' }];
    const source = [{ id: 1, name: 'John' }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toEqual([{ id: 1, name: 'John' }]);
  });

  it('should ignore non-array types and return undefined when either target or source is not an array', () => {
    const target = { id: 1, name: 'John' };
    const source = [{ id: 1, age: 30 }];
    const result = deepMergeWithIdCustomizer(target, source);
    expect(result).toBeUndefined();
  });
});
