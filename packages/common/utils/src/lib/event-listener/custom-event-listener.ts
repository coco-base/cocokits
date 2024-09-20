/** @module event-listener */

type EventListenerCallback<T> = (event: T) => void;

export class CustomEventListener<T> {
  private callbacks = new Set<EventListenerCallback<T>>();

  private _lastValue: T | undefined;
  public get lastValue(): T | undefined {
    return this._lastValue;
  }

  private set lastValue(value: T) {
    this._lastValue = value;
  }

  public addEventListener(callback: EventListenerCallback<T>) {
    this.callbacks.add(callback);
  }

  public removeEventListener(callback: EventListenerCallback<T>) {
    this.callbacks.delete(callback);
  }

  public removeAllEventListener() {
    this.callbacks.clear();
  }

  public emit(value: T) {
    this.lastValue = value;
    this.callbacks.forEach((callback) => callback(value));
  }
}
