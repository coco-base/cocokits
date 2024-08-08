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
