'use client';

import { useState } from 'react';

/**
 * The `modal` value an overlay uses while it is open. Switching `modal` while open takes effect at the next open,
 * so the value is taken when the overlay opens and kept until it closes.
 *
 * @param open - Whether the overlay is open.
 * @param modal - The `modal` prop.
 * @returns The `modal` value for the current open period; the prop itself while closed.
 */
export function useModalAtOpen(open: boolean, modal: boolean): boolean {
  const [state, setState] = useState({ open, modal });
  const wasOpen = state.open;
  if (wasOpen !== open || (!open && state.modal !== modal)) {
    setState({ open, modal: open && wasOpen ? state.modal : modal });
  }
  return open && wasOpen ? state.modal : modal;
}
