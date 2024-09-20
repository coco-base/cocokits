/** @module event-listener */

/**
 * Adds an event listener to an HTML element that triggers only once. After the event
 * fires for the first time, the listener is automatically removed.
 *
 * This is useful when you want to handle an event only once, such as for one-time
 * user interactions (e.g., closing a modal, submitting a form). Using this approach
 * prevents unnecessary event handling after the first occurrence, improving performance
 * and reducing potential side effects from handling the event multiple times.
 *
 * @template K The type of event being listened to, derived from `HTMLElementEventMap`.
 * @param element The HTML element to which the event listener is added.
 * @param eventName The name of the event to listen for.
 * @param callback The function to be called when the event is triggered.
 *
 * @example
 * The callback will only execute once, then the listener will be removed.
 *
 * ```typescript
 * const button = document.querySelector('button');
 * onceEventListener(button, 'click', () => console.log('Button clicked'));
 * ```
 */
export function onceEventListener<K extends keyof HTMLElementEventMap>(
  element: HTMLElement,
  eventName: K,
  callback: (ev: HTMLElementEventMap[K]) => void
) {
  const onEvent = (e: HTMLElementEventMap[K]) => {
    callback(e);
    element.removeEventListener(eventName, onEvent);
  };

  element.addEventListener(eventName, onEvent);
}
