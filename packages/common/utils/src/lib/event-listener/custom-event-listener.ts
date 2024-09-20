/** @module event-listener */

type EventListenerCallback<T> = (event: T) => void;

/**
 * A generic class for managing custom event listeners, allowing users to register multiple callbacks
 * for custom events and emit events that trigger these callbacks in a synchronous manner.
 *
 * Custom event listeners are useful for decoupling parts of an application by allowing communication
 * through events without requiring direct references between components.
 *
 * @template T The type of the event being emitted.
 */
export class CustomEventListener<T> {
  private callbacks = new Set<EventListenerCallback<T>>();

  private _lastValue: T | undefined;

  /**
   * Gets the most recent value emitted by the event listener.
   *
   * @returns The last emitted value, or `undefined` if no value has been emitted yet.
   *
   * @example
   * ```typescript
   * const listener = new CustomEventListener<number>();
   * listener.emit(10);
   * console.log(listener.lastValue); // Outputs: 10
   * ```
   */
  public get lastValue(): T | undefined {
    return this._lastValue;
  }

  private set lastValue(value: T) {
    this._lastValue = value;
  }

  /**
   * Adds a new callback function to the event listener. When the event is emitted, the
   * provided callback is invoked synchronously with the event value.
   * If the same callback is added multiple times, it will only be called once when the event is emitted.
   *
   * @param callback The function to be executed when the event is emitted.
   *
   * @example
   * ```typescript
   * const listener = new CustomEventListener<string>();
   * listener.addEventListener((value) => console.log(value));
   * listener.emit('Hello, world!'); // Outputs: Hello, world!
   * ```
   */
  public addEventListener(callback: EventListenerCallback<T>) {
    this.callbacks.add(callback);
  }

  /**
   * Removes a previously added event listener. If the callback is not present, nothing happens.
   *
   * @param callback The function to remove from the event listener.
   *
   * @example
   * ```typescript
   * const listener = new CustomEventListener<number>();
   * const callback = (value: number) => console.log(value);
   * listener.addEventListener(callback);
   * listener.removeEventListener(callback);
   * listener.emit(10); // No output
   * ```
   */
  public removeEventListener(callback: EventListenerCallback<T>) {
    this.callbacks.delete(callback);
  }

  /**
   * Removes all callback functions from the event listener. After calling this, no listeners
   * will be triggered by emitted events.
   *
   * @example
   * ```typescript
   * const listener = new CustomEventListener<boolean>();
   * listener.addEventListener((value) => console.log(value));
   * listener.removeAllEventListener();
   * listener.emit(true); // No output
   * ```
   */
  public removeAllEventListener() {
    this.callbacks.clear();
  }

  /**
   * Emits a new event value to all registered listeners. The event listeners will be invoked
   * synchronously and in the order they were added. If no listeners are registered, this method
   * does nothing.
   *
   * @param value The value to be emitted to all listeners.
   *
   * @example
   * ```typescript
   * const listener = new CustomEventListener<number>();
   * listener.addEventListener((value) => console.log('First:', value));
   * listener.addEventListener((value) => console.log('Second:', value));
   * listener.emit(42); // Outputs: First: 42 Second: 42
   * ```
   */
  public emit(value: T) {
    this.lastValue = value;
    this.callbacks.forEach((callback) => callback(value));
  }
}
