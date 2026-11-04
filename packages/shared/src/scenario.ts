/**
 * Where a step acts or looks. Targets never search the docs page: the runner resolves them in the whole document of the
 * preview frame of the story, so a part an overlay portals out of the story root is found too. `part(name, i)` counts
 * every element with the part class in document order.
 */
export type ScenarioTarget =
  | {
      readonly kind: 'part';
      /** The anatomy part, for example `trigger`; the element is the one with the part's class. */
      readonly partName: string;
      /** The i-th element with the part class, from 0; `-1` is the last. */
      readonly index: number;
    }
  | {
      readonly kind: 'role';
      /** An ARIA role, for example `checkbox`. */
      readonly role: string;
      /** The accessible name, matched exactly; absent when the role is unique in the story. */
      readonly name?: string;
    }
  | {
      readonly kind: 'within';
      /** The element the target is searched in; it can be a `within` itself. */
      readonly container: ScenarioTarget;
      /** The target, matched only inside the container. */
      readonly target: ScenarioTarget;
    };

/** A value of an event, as the Events panel prints it. */
export type ScenarioEventValue = string | number | boolean;

/** What an event row must show; a field that is absent is not checked. */
export interface ScenarioEventExpectation {
  /** The value the row shows (`''` for an empty text). */
  readonly value?: ScenarioEventValue;
  /** The reason the row shows, for example `user` or `form-reset`. */
  readonly reason?: string;
}

/** One step of a scenario. Actions come first, then expectations. */
export type ScenarioStep =
  | { readonly kind: 'click'; readonly target: ScenarioTarget }
  | { readonly kind: 'focus'; readonly target: ScenarioTarget }
  | { readonly kind: 'type'; readonly target: ScenarioTarget; readonly text: string }
  | { readonly kind: 'press'; readonly key: string }
  | { readonly kind: 'hover'; readonly target: ScenarioTarget }
  | { readonly kind: 'clickOutside' }
  | { readonly kind: 'expectText'; readonly target: ScenarioTarget; readonly text: string }
  | { readonly kind: 'expectAttr'; readonly target: ScenarioTarget; readonly attrName: string; readonly value: string }
  | { readonly kind: 'expectValue'; readonly target: ScenarioTarget; readonly text: string }
  | { readonly kind: 'expectChecked'; readonly target: ScenarioTarget; readonly checked: boolean | 'mixed' }
  | { readonly kind: 'expectFocus'; readonly target: ScenarioTarget }
  | { readonly kind: 'expectAbsent'; readonly target: ScenarioTarget }
  | { readonly kind: 'expectInert'; readonly target: ScenarioTarget }
  | ({ readonly kind: 'expectEvent'; readonly eventName: string } & ScenarioEventExpectation);

/** A scenario: a story plus ordered steps. */
export interface ScenarioDef {
  /** The component folder the file sits in, for example `checkbox`. */
  readonly component: string;
  /** The id, equal to the file name without `.scenario.ts`. */
  readonly id: string;
  /** The id of the story the scenario runs on. */
  readonly storyId: string;
  /** What the scenario proves, as a sentence. */
  readonly title: string;
  readonly steps: readonly ScenarioStep[];
}

/** A scenario as the `stories` target writes it to `<theme>/<component>/<id>.scenario.json`. */
export interface ScenarioMeta extends ScenarioDef {
  /** The theme whose story the scenario runs on. */
  readonly theme: string;
}

/**
 * Declares a scenario. It returns its argument; the story compiler reads the file, it does not run it, so the call
 * must be an object literal and every step a call of this module with literal arguments.
 *
 * @param scenario - The scenario.
 * @returns The same object.
 * @example
 * export default defineScenario({
 *   component: 'radio',
 *   id: 'plan',
 *   storyId: 'plan',
 *   title: 'The arrow keys move the check',
 *   steps: [focus(role('radio', { name: 'Basic' })), press('ArrowDown'), expectChecked(role('radio', { name: 'Pro' }), true)],
 * });
 */
export function defineScenario(scenario: ScenarioDef): ScenarioDef {
  return scenario;
}

/**
 * Targets the i-th element with the class of an anatomy part.
 *
 * @param partName - The part name.
 * @param index - From 0; `-1` is the last.
 */
export function part(partName: string, index = 0): ScenarioTarget {
  return { kind: 'part', partName, index };
}

/**
 * Targets an element by its ARIA role and, when it matters, its exact accessible name.
 *
 * @param ariaRole - The role.
 * @param options - The exact accessible name.
 */
export function role(ariaRole: string, options: { readonly name?: string } = {}): ScenarioTarget {
  return options.name === undefined
    ? { kind: 'role', role: ariaRole }
    : { kind: 'role', role: ariaRole, name: options.name };
}

/**
 * Targets an element only inside another one, as Testing Library's `within(element)` binds its queries to an element. It
 * reaches the Close button of the inner one of two dialogs. It nests, and `part(name, index)` then counts inside the
 * container.
 *
 * @param container - The element to search in.
 * @param target - What to find inside it.
 */
export function within(container: ScenarioTarget, target: ScenarioTarget): ScenarioTarget {
  return { kind: 'within', container, target };
}

/** A real click on the target. */
export function click(target: ScenarioTarget): ScenarioStep {
  return { kind: 'click', target };
}

/** Moves the focus to the target. */
export function focus(target: ScenarioTarget): ScenarioStep {
  return { kind: 'focus', target };
}

/** Focuses the target and types the text with real key presses. */
export function type(target: ScenarioTarget, text: string): ScenarioStep {
  return { kind: 'type', target, text };
}

/** Presses a key (`'ArrowDown'`) or a chord (`'Shift+Tab'`) where the focus is. */
export function press(key: string): ScenarioStep {
  return { kind: 'press', key };
}

/** A real pointer move to the centre of the target; nothing is pressed. */
export function hover(target: ScenarioTarget): ScenarioStep {
  return { kind: 'hover', target };
}

/**
 * A real press and release of the pointer 4px inside the top-left corner of the preview frame, a point no story stage
 * covers: the press is outside every layer of the story, an overlay included.
 */
export function clickOutside(): ScenarioStep {
  return { kind: 'clickOutside' };
}

/** Expects the whole text of the target. */
export function expectText(target: ScenarioTarget, text: string): ScenarioStep {
  return { kind: 'expectText', target, text };
}

/** Expects an attribute of the target to have this value (`''` for a bare attribute). */
export function expectAttr(target: ScenarioTarget, attrName: string, value: string): ScenarioStep {
  return { kind: 'expectAttr', target, attrName, value };
}

/** Expects the value of a field. */
export function expectValue(target: ScenarioTarget, text: string): ScenarioStep {
  return { kind: 'expectValue', target, text };
}

/** Expects a checkbox or radio to be checked, unchecked or (`'mixed'`) indeterminate. */
export function expectChecked(target: ScenarioTarget, checked: boolean | 'mixed'): ScenarioStep {
  return { kind: 'expectChecked', target, checked };
}

/** Expects the target to have the focus. */
export function expectFocus(target: ScenarioTarget): ScenarioStep {
  return { kind: 'expectFocus', target };
}

/**
 * Expects nothing to match the target, or every match to be hidden. The step retries until it holds, so an overlay that
 * unmounts a moment after the action is not a flake.
 */
export function expectAbsent(target: ScenarioTarget): ScenarioStep {
  return { kind: 'expectAbsent', target };
}

/**
 * Expects the target to be inert: it cannot be used. A press at its centre does not reach it and a script focus on it does
 * not move the focus to it. It holds for the page behind an open modal dialog and for an `inert` subtree. The step retries
 * until it holds, and it finds the target even where the accessibility tree hides it.
 */
export function expectInert(target: ScenarioTarget): ScenarioStep {
  return { kind: 'expectInert', target };
}

/**
 * Expects the newest row of the Events panel to show this event. The story must report the event.
 *
 * @param eventName - The event name, for example `valueChange`.
 * @param shown - The value and reason the row shows; a field left out is not checked.
 */
export function expectEvent(eventName: string, shown: ScenarioEventExpectation = {}): ScenarioStep {
  return { kind: 'expectEvent', eventName, ...shown };
}
