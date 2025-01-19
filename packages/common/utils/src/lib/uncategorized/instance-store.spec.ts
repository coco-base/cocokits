import { describe, expect, it, vi } from 'vitest';

import { getInstance } from './instance-store';

class TestClass {
  value: number;
  constructor() {
    this.value = Math.random();
  }
}

describe('InstanceStore', () => {
  it('should return the same instance for the same class', () => {
    const instance1 = getInstance(TestClass);
    const instance2 = getInstance(TestClass);
    expect(instance1).toBe(instance2);
  });

  it('should return different instances for different classes', () => {
    class AnotherClass {}

    const instance1 = getInstance(TestClass);
    const instance2 = getInstance(AnotherClass);
    expect(instance1).not.toBe(instance2);
  });

  it('should call the constructor only once for the same class', () => {
    // We can mock an entire class with a single vi.fn call - since all classes are also functions, this works out of the box.
    // https://vitest.dev/guide/mocking#classes
    const DummyClass = vi.fn();
    getInstance(DummyClass);
    getInstance(DummyClass);
    expect(DummyClass).toHaveBeenCalledTimes(1);
  });

  it('should store and retrieve instances correctly', () => {
    const instance = getInstance(TestClass);
    expect(instance).toBeInstanceOf(TestClass);
    expect(instance.value).toBeDefined();
  });
});
