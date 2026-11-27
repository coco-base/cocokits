import { DestroyRef, afterNextRender, inject } from '@angular/core';

/**
 * Listens to an event on an element after every listener the consumer put on it, so the consumer can veto the
 * change with `event.preventDefault()` whatever the order of the directives in `imports`. A `host` listener
 * cannot do this: Angular calls the host and template listeners of one event in `imports` order. A listener
 * added after the first render runs last. Call it in an injection context (a constructor). Nothing is listened
 * to on the server. The listener is removed when the directive is destroyed.
 *
 * @param element - The element the directive sits on.
 * @param type - The event type, such as `click`.
 * @param listener - Called for the event; check `event.defaultPrevented` before acting.
 * @internal
 */
export function listenLast(element: Element, type: string, listener: (event: Event) => void): void {
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    element.addEventListener(type, listener);
    destroyRef.onDestroy(() => {
      element.removeEventListener(type, listener);
    });
  });
}

/**
 * Listens to an event on an element in the capture phase, before every listener the consumer put on it, so a
 * guard can stop them (a disabled link's click, a router link). A `host` listener cannot do this: Angular merges
 * the listeners of one event on one element into one bubble-phase listener. Added after the first render, so
 * nothing is listened to on the server; removed when the directive is destroyed. Call it in an injection
 * context (a constructor).
 *
 * @param element - The element the directive sits on.
 * @param type - The event type, such as `click`.
 * @param listener - Called for the event before the element's other listeners.
 * @internal
 */
export function listenFirst(element: Element, type: string, listener: (event: Event) => void): void {
  const destroyRef = inject(DestroyRef);
  afterNextRender(() => {
    element.addEventListener(type, listener, { capture: true });
    destroyRef.onDestroy(() => {
      element.removeEventListener(type, listener, { capture: true });
    });
  });
}

/** The `eventPhase` Angular gives an event it replays after hydration (`EventPhase.REPLAY` of its event dispatch). */
const REPLAY_PHASE = 101;

/**
 * Runs `listener` for an event that Angular replays after hydration, once every listener of the replay has run, so
 * the consumer's `preventDefault()` still vetoes it. A live event does nothing here: `listenLast` handles it.
 * `listenLast` and `listenFirst` listen after the first render, with `addEventListener`, which a click made before
 * hydration never reaches; a `host` listener does, because Angular records the clicks on elements that have one.
 * Call it from a `host` listener of the same event. It waits for a microtask: Angular calls all the listeners of a
 * replayed event in one synchronous loop, and they all see the same `defaultPrevented`.
 *
 * @param event - The event the `host` listener received.
 * @param listener - Called for a replayed event, with the event, if no listener prevented its default.
 * @internal
 */
export function afterReplay(event: Event, listener: (event: Event) => void): void {
  if (event.eventPhase !== REPLAY_PHASE) return;
  queueMicrotask(() => {
    if (!event.defaultPrevented) listener(event);
  });
}
