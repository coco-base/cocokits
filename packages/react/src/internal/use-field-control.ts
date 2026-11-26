'use client';

import { createContext, useContext, useState, type Context, type RefObject } from 'react';
import type { FormFieldControlState } from '@cocokits/machines/form-field';
import { isDevelopment } from './dev';
import type { FormFieldContextValue } from './form-field-context';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/**
 * Marks the content of a zone of a FormField (Leading, Trailing, Prefix, Suffix): a control inside it reads the
 * field's state but does not claim the field, so the Label, the ids and the description stay with the field's own
 * control. `false` outside a zone.
 */
export const FieldZoneContext: Context<boolean> = createContext(false);

/**
 * Makes the control the field's control when none is yet, and releases the claim on unmount. The first control
 * to claim is the field's control for as long as it is mounted; a later one warns once in development. A control
 * in a zone of the field does not claim it and does not warn.
 *
 * @param field - The FormField context, or `null` outside a field.
 * @param elementRef - The ref of the native control, which the field focuses on a click in its box.
 * @param consequence - The development warning's sentence about what the second control does not get.
 * @returns Whether this control is the field's control (`true` outside a field, `false` in a zone of one).
 */
export function useControlClaim(
  field: FormFieldContextValue | null,
  elementRef: RefObject<HTMLElement | null>,
  consequence: string,
): boolean {
  const inZone = useContext(FieldZoneContext) && field !== null;
  const [primary, setPrimary] = useState(true);
  // The field's functions are stable, so the registration runs once per mount.
  const claim = inZone ? undefined : field?.claim;
  const release = inZone ? undefined : field?.release;
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!claim || !release || !element) return undefined;
    const isControl = claim(elementRef, element);
    setPrimary(isControl);
    if (!isControl && isDevelopment()) {
      console.warn(
        `CocoKits: a FormField holds one control. ${consequence} Use a second FormField, or a fieldset with a legend for a set.`,
      );
    }
    return () => {
      release(elementRef);
    };
  }, [claim, release]);
  return !inZone && primary;
}

/**
 * Gives the field the state of its control after every commit; the field ignores it unless this control holds
 * the claim.
 *
 * @param field - The FormField context, or `null` outside a field.
 * @param elementRef - The ref that identifies the control to the field.
 * @param primary - Whether this control holds the claim.
 * @param control - The state the machine reported for the control.
 */
export function useControlReport(
  field: FormFieldContextValue | null,
  elementRef: RefObject<HTMLElement | null>,
  primary: boolean,
  control: FormFieldControlState,
): void {
  const report = field?.report;
  useIsomorphicLayoutEffect(() => {
    if (primary) report?.(elementRef, control);
  });
}
