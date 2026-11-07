'use client';

import { useRef, type FocusEvent, type KeyboardEvent, type MouseEvent, type RefObject } from 'react';
import { trackLabelActivation, type LabelActivation } from '@cocokits/cdk/form-control';
import type { Typeahead } from '@cocokits/cdk/roving-focus';
import type { SelectEvent, SelectTriggerProps } from '@cocokits/machines/select';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import type { SelectHighlight } from './use-select-highlight';

/** What the hook reads. */
export interface SelectTriggerOptions {
  /** The machine's trigger props, which hold the handlers. */
  readonly trigger: SelectTriggerProps;
  /** The trigger element, `null` until it is attached. */
  readonly element: HTMLButtonElement | null;
  /** The ref of the trigger element. */
  readonly elementRef: RefObject<HTMLButtonElement | null>;
  /** Whether the list is open. */
  readonly isOpen: boolean;
  /** Whether the Select reacts to the user. */
  readonly interactive: boolean;
  /** How many options have mounted; they mount with the list. */
  readonly itemCount: number;
  /** The type-to-find buffer. */
  readonly typeahead: Typeahead;
  /** Sends a machine event. */
  readonly dispatch: (event: SelectEvent) => boolean;
  /** Whether an outside press is being decided: the focus move it causes must not close the list on its own. */
  readonly isFocusOutHeld: () => boolean;
  /** Whether the list's dismiss layer is active, so it answers Escape and the Content handlers can refuse it. */
  readonly isLayerActive: () => boolean;
  /** Starts the highlight when the options have mounted. */
  readonly begin: SelectHighlight['begin'];
  /** Records whether the trigger has focus. */
  readonly onFocusChange: (focused: boolean) => void;
  /** Called when the trigger loses focus. */
  readonly onTouched: () => void;
}

/** The handlers to put on the trigger. */
export interface SelectTriggerHandlers {
  readonly onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  readonly onKeyUp: (event: KeyboardEvent<HTMLButtonElement>) => void;
  readonly onFocus: () => void;
  readonly onBlur: (event: FocusEvent<HTMLButtonElement>) => void;
}

const isPrintable = (event: globalThis.KeyboardEvent): boolean =>
  event.key.length === 1 && event.key !== ' ' && !event.altKey && !event.ctrlKey && !event.metaKey;

/**
 * The handlers of the trigger. A click that finds the trigger unfocused focuses it before it toggles the list. A click on the label of a field forwards a click to the trigger: it takes the
 * focus and does not open. The options mount with the list, so a character typed on a closed Select opens it and
 * finds its option when they have mounted. The machine handlers need the native event.
 *
 * @param options - The machine's trigger props and what the handlers read.
 * @returns The handlers.
 */
export function useSelectTrigger(options: SelectTriggerOptions): SelectTriggerHandlers {
  const { trigger, element, elementRef, isOpen, interactive, itemCount, typeahead, dispatch, begin } = options;
  const labelActivation = useRef<LabelActivation | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!element) return undefined;
    const created = trackLabelActivation(element);
    labelActivation.current = created;
    return () => {
      created.destroy();
      labelActivation.current = null;
    };
  }, [element]);

  return {
    onClick: (event) => {
      if (labelActivation.current?.consume()) {
        elementRef.current?.focus();
        return;
      }
      // Safari never focuses a button on a press, and Firefox does not when the press moves focus into the frame:
      // the combobox needs the focus for the keys and `aria-activedescendant`.
      const button = event.currentTarget;
      if (interactive && button.ownerDocument.activeElement !== button) button.focus({ preventScroll: true });
      trigger.onClick(event.nativeEvent);
    },
    onKeyDown: (event) => {
      const native = event.nativeEvent;
      if (!isOpen && itemCount === 0 && interactive && !native.defaultPrevented && isPrintable(native)) {
        native.preventDefault();
        dispatch({ type: 'TRIGGER.OPEN', initial: 'selected', event: native });
        begin('selected', native.key);
        return;
      }
      // The list's dismiss layer answers Escape, so that the Content handlers can refuse it.
      if (native.key === 'Escape' && isOpen && options.isLayerActive()) return;
      trigger.onKeyDown(native);
    },
    onKeyUp: (event) => {
      trigger.onKeyUp(event.nativeEvent);
    },
    onFocus: () => {
      options.onFocusChange(true);
    },
    onBlur: (event) => {
      if (!options.isFocusOutHeld()) trigger.onBlur(event.nativeEvent);
      typeahead.reset();
      options.onFocusChange(false);
      options.onTouched();
    },
  };
}
