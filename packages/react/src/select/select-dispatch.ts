import type { SelectEvent, SelectTransition } from '@cocokits/machines/select';
import type { SelectModel, SelectModelValue } from './use-select-model';

/** What {@link applySelectTransition} changes besides the model. */
export interface SelectTransitionEffects {
  /** The user changed the value: the Select is dirty and a blocked submit is cleared. */
  readonly changed: () => void;
  /** Starts the highlight when the items have mounted. */
  readonly begin: (event: SelectEvent) => void;
  /** Sets the highlight; `undefined` clears it. */
  readonly highlight: (key: string | undefined) => void;
  /** Scrolls the highlighted item into view. */
  readonly reveal: () => void;
}

/**
 * Applies what the machine decided, in the order the refusals need:
 *
 * - A press outside asks to close first, so a refused close commits nothing; then the value is chosen and a
 *   `cancel()` of the value does not keep the list open.
 * - A choice inside the list asks for the value first: a canceled value keeps the list as it is.
 * - Focus leaving the trigger chooses the value (its refusal keeps the old value) and always closes.
 *
 * @param next - The transition the machine returned.
 * @param event - The event that caused it.
 * @param model - The value and the open state.
 * @param effects - The view effects.
 * @returns `false` when a change was refused, `true` otherwise.
 */
export function applySelectTransition<T>(
  next: SelectTransition<T | null>,
  event: SelectEvent,
  model: SelectModel<T>,
  effects: SelectTransitionEffects,
): boolean {
  const reason = next.open?.reason;
  const commitOpen = (): boolean =>
    next.open ? model.setOpen(next.open.open, { reason: next.open.reason, event: event.event }) : true;
  let opened: boolean | undefined;
  if (next.value !== undefined) {
    if (reason === 'outside-press') {
      opened = commitOpen();
      if (!opened) return false;
    }
    effects.changed();
    const accepted = model.setValue(next.value as SelectModelValue<T>, { reason: 'user', event: event.event });
    if (!accepted && reason !== 'blur' && reason !== 'outside-press') return false;
  }
  opened ??= commitOpen();
  if (!opened) return false;
  if (next.open?.open) effects.begin(event);
  if (next.highlight !== undefined) effects.highlight(next.highlight ?? undefined);
  if (next.reveal) effects.reveal();
  return true;
}
