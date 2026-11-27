/** The part of a React synthetic event that machine handlers can reach through the shim. */
export interface ReactEventLike {
  /** Whether a handler already called `preventDefault()` on the event. */
  readonly defaultPrevented: boolean;
  /** Cancels the default action of the event. */
  preventDefault(): void;
  /** Stops the event from reaching the handlers of other elements. */
  stopPropagation(): void;
}

type Handler = (event: ReactEventLike) => void;

/** The machine (HTML) names that React spells differently. */
interface ReactNames {
  readonly class: 'className';
  readonly tabindex: 'tabIndex';
  readonly readonly: 'readOnly';
  readonly for: 'htmlFor';
  readonly autocomplete: 'autoComplete';
}

/** Machine props with React names; every `on*` handler takes a React event. */
export type ReactProps<P extends object> = {
  [K in keyof P as K extends keyof ReactNames ? ReactNames[K] : K]: K extends `on${string}`
    ? Handler | Extract<P[K], undefined>
    : P[K];
};

const NAMES: Readonly<Record<string, string>> = {
  class: 'className',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  for: 'htmlFor',
  autocomplete: 'autoComplete',
};

/**
 * Converts machine props (HTML names) to React props: `class` becomes `className`, `tabindex`
 * becomes `tabIndex`, `readonly` becomes `readOnly`, `for` becomes `htmlFor` and `autocomplete` becomes `autoComplete`. Every `on*` handler gets an event whose `stopImmediatePropagation()`
 * calls the React event's `stopPropagation()`, because React has no `stopImmediatePropagation`
 * and a machine guard must keep ancestors' handlers from running.
 *
 * @internal
 * @param props - The machine props.
 * @returns A new record with React names; absent keys stay absent.
 */
export function toReactProps<P extends object>(props: P): ReactProps<P> {
  const result: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(props)) {
    result[NAMES[name] ?? name] =
      /^on[A-Z]/.test(name) && typeof value === 'function' ? wrap(value as (event: unknown) => void) : value;
  }
  return result as ReactProps<P>;
}

function wrap(handler: (event: unknown) => void): Handler {
  return (event: ReactEventLike) => {
    handler({
      get defaultPrevented() {
        return event.defaultPrevented;
      },
      preventDefault: () => {
        event.preventDefault();
      },
      stopImmediatePropagation: () => {
        event.stopPropagation();
      },
    });
  };
}
