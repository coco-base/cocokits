/** @module common */

/**
 * InstanceStore class to manage and provide instances of other classes.
 * This class ensures that only one instance of each class is created and reused throughout the application.
 * Instances are stored in a map, keyed by the class reference.
 */
class InstanceStore {
  // Using a generic instance map to store instances by class
  private static instances: Map<any, any> = new Map();

  /**
   * Retrieves a single instance of the specified class.
   * If an instance of the class has already been created, it returns the same instance.
   * Otherwise, it creates a new instance and returns it.
   *
   * @template T - The type of the class instance.
   * @param classRef - A reference to the class constructor.
   * @returns The single instance of the specified class.
   *
   * @example
   * ```typescript
   * class MyClass {
   *   // class implementation
   * }
   *
   * const instance = InstanceStore.getInstance(MyClass);
   * ```
   */
  static getInstance<T>(classRef: new () => T): T {
    if (!InstanceStore.instances.has(classRef)) {
      InstanceStore.instances.set(classRef, new classRef());
    }
    return InstanceStore.instances.get(classRef);
  }
}

/**
 * Retrieves a single instance of the specified class.
 * This ensures that a single instance of the specified class is used throughout the application.
 * If the instance of the class has already been created, it returns the same instance.
 * Otherwise, it creates a new instance and returns it. Later, it will return this created instance
 * if somewhere else in the app wants to use it.
 *
 * @template T - The type of the class instance.
 * @param classRef - A reference to the class constructor.
 * @returns The single instance of the specified class.
 *
 * @example
 * ```typescript
 * class MyClass {
 *   // class implementation
 * }
 *
 * const instance = getInstance(MyClass);
 * const sameInstance = getInstance(MyClass);
 * console.log(instance === sameInstance); // Output: true
 * ```
 */
export function getInstance<T>(classRef: new () => T): T {
  return InstanceStore.getInstance(classRef);
}
