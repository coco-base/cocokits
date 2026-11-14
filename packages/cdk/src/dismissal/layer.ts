import { containsDeep } from '@cocokits/utils';
import type { DismissIntent } from './dismiss-intent';
import type { DismissReason } from './dismiss-reason';

/** @internal One registered overlay in a document's stack. */
export interface Layer {
  readonly getInside: () => readonly (Element | null)[];
  readonly getDialog: (() => HTMLDialogElement | null) | undefined;
  readonly onDismiss: (intent: DismissIntent) => void;
  readonly dismissOn: ReadonlySet<DismissReason>;
  readonly getParent: (() => object | null) | undefined;
  /** A barrier without a native dialog (a popover that makes the outside inert). */
  readonly modal: boolean;
  /** Stops intents; a modal stays a barrier until it is destroyed. */
  exited: boolean;
  destroyed: boolean;
}

/** @internal The layer behind a public handle, for `getParent`. */
export const layerOf: WeakMap<object, Layer> = new WeakMap<object, Layer>();

/**
 * A modal layer is a barrier: everything below it is out of reach. It is the one with a native dialog, except
 * while that dialog is open without being modal, and a layer made `modal` by the adapter.
 */
export function isModal(layer: Layer): boolean {
  if (layer.modal) return true;
  const dialog = layer.getDialog?.();
  if (layer.getDialog === undefined) return false;
  return !(dialog?.open && !dialog.matches(':modal'));
}

/** @internal The live layer this one opened from, read when the stack is used. */
export function parentOf(layer: Layer): Layer | undefined {
  const handle = layer.getParent?.() ?? null;
  const parent = handle ? layerOf.get(handle) : undefined;
  return parent && !parent.destroyed && parent !== layer ? parent : undefined;
}

/**
 * @internal The stack from bottom to top: registration order, except that a layer is always above the
 * layer it opened from, whatever order the framework registered them in.
 */
export function orderLayers(layers: readonly Layer[]): Layer[] {
  const result: Layer[] = [];
  const visiting = new Set<Layer>();
  const visit = (layer: Layer): void => {
    if (result.includes(layer) || visiting.has(layer)) return;
    visiting.add(layer);
    const parent = parentOf(layer);
    if (parent && layers.includes(parent)) visit(parent);
    result.push(layer);
  };
  layers.forEach(visit);
  return result;
}

/** Whether the target is in the layer's own elements or in a layer opened from it. */
export function isInside(
  layer: Layer,
  target: Node | null,
  layers: readonly Layer[],
  seen: Set<Layer> = new Set<Layer>(),
): boolean {
  if (!target || seen.has(layer)) return false;
  seen.add(layer);
  if (layer.getInside().some((element) => element && containsDeep(element, target))) return true;
  return layers.some((other) => parentOf(other) === layer && isInside(other, target, layers, seen));
}

/** @internal The deepest target of an event, looking through open shadow roots. */
export function eventTarget(event: Event): Node | null {
  return (event.composedPath()[0] ?? event.target) as Node | null;
}
