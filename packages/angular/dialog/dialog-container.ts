import {
  ChangeDetectionStrategy,
  Component,
  RendererFactory2,
  effect,
  inject,
  untracked,
  type ComponentRef,
} from '@angular/core';
import type { ZoneBoundary } from '@cocokits/angular-core';
import { waitForAnimations } from '@cocokits/cdk/presence';
import type { CckDialogConfig } from './dialog-config';
import { applyAutoFocus } from './dialog-focus';
import type { CckDialogRef } from './dialog-ref';
import { CckDialogContent } from './dialog-content';
import { CckDialogPortal } from './dialog-portal';
import { CckDialogRoot, type DialogChangeDetails } from './dialog-root';

/**
 * The hidden root and the `<dialog>` of a dialog that `CckDialog.open` renders: the declarative Dialog without
 * its trigger. The service creates one per `open()`, so the service reuses the root's presence, dismissal,
 * scroll lock, modal exit and focus return. It is never written in a template.
 *
 * @internal
 */
@Component({
  selector: 'cck-dialog-container',
  imports: [CckDialogPortal, CckDialogContent],
  hostDirectives: [{ directive: CckDialogRoot, inputs: ['closePredicate'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template cckDialogPortal>
      <dialog cckDialogContent></dialog>
    </ng-template>
  `,
})
export class CckDialogContainer {
  /** The root the service drives. */
  readonly _root = inject(CckDialogRoot);
}

/** What a dialog session needs from `CckDialog.open`. */
export interface DialogSessionOptions<D, T, R> {
  readonly container: ComponentRef<CckDialogContainer>;
  readonly ref: CckDialogRef<T, R>;
  readonly config: CckDialogConfig<D>;
  /** The opened view's root nodes; they move into the `<dialog>` before it is shown. */
  readonly nodes: readonly Node[];
  /** The element that had focus when `open` was called. */
  readonly opener: HTMLElement;
  readonly zone: ZoneBoundary;
  /** Called once the dialog is finished, to destroy the views. */
  readonly destroy: () => void;
}

/** What the service keeps of a running session. */
export interface DialogSession<R> {
  /** `ref.close()`: the predicate may refuse. */
  requestClose(result: R | undefined): void;
  /** A close that skips `disableClose` and the predicate (navigation). */
  forceClose(): void;
}

/** The names of an `ariaLabelledBy` / `ariaDescribedBy` string. */
function ids(value: string | null | undefined): readonly string[] {
  return value ? value.split(/\s+/).filter((id) => id !== '') : [];
}

/**
 * Connects the root of a rendered dialog to its ref and config: the attributes, the close decision, the streams,
 * focus and the end of life. It returns the two ways the ref and the service close the dialog.
 *
 * @param options - The container, ref, config and opened view.
 * @returns The close requests.
 */
export function startDialogSession<D, T, R>(options: DialogSessionOptions<D, T, R>): DialogSession<R> {
  const { container, ref, config, nodes, opener, zone } = options;
  const { _root: root } = container.instance;
  const doc = opener.ownerDocument;
  const renderer = container.injector.get(RendererFactory2).createRenderer(null, null);
  let pending: R | undefined;
  let shown = false;
  let finished = false;

  /** The result a close from inside the dialog gives, once nothing refused it. */
  const decide = (details: DialogChangeDetails): boolean => {
    const result = (details.reason === 'close' ? root._closeValue : undefined) as R | undefined;
    root._closeValue = undefined;
    // `disableClose` blocks Escape and the backdrop first; the predicate then sees every other close too.
    if ((details.reason === 'escape' || details.reason === 'outside-press') && ref.disableClose) return false;
    if (config.closePredicate && !config.closePredicate(result, config, ref.componentInstance)) return false;
    pending = result;
    return true;
  };
  container.setInput('closePredicate', decide);

  const finish = (): void => {
    if (finished) return;
    finished = true;
    zone.inside(() => {
      ref._finish();
    });
    // The views are destroyed after the subscribers of `afterClosed` have run.
    queueMicrotask(options.destroy);
  };

  root._serviceAttrs.set({
    id: ref.id,
    role: config.role,
    label: config.ariaLabel,
    labelledBy: ids(config.ariaLabelledBy),
    describedBy: ids(config.ariaDescribedBy),
    modal: config.ariaModal,
    autofocus: config.autoFocus === 'dialog' || config.autoFocus === false,
  });

  const restore = config.restoreFocus;
  root._hooks = {
    returnTo:
      restore === true
        ? () => opener
        : typeof restore === 'string'
          ? () => doc.querySelector<HTMLElement>(restore)
          : restore instanceof HTMLElement
            ? () => restore
            : null,
    backdropPress: (event) => {
      ref._emitBackdropClick(event as MouseEvent);
    },
    beforeShow: (dialog) => {
      shown = true;
      dialog.append(...nodes);
      zone.outside(() =>
        renderer.listen(dialog, 'keydown', (event: KeyboardEvent) => {
          // A dialog opened from inside this one is a descendant: its keys are not this dialog's.
          if ((event.target as Element | null)?.closest('dialog') !== dialog) return;
          zone.inside(() => {
            ref._emitKeydown(event);
          });
        }),
      );
    },
    shown: (dialog) => {
      applyAutoFocus(dialog, config.autoFocus, renderer);
      void zone
        .outside(() => waitForAnimations(dialog))
        .then(() => {
          zone.inside(() => {
            ref._markOpened();
          });
        });
    },
    returned: finish,
  };

  // Every close the dialog makes itself (Close, Escape, the backdrop, a form) has passed `decide`.
  root.closed.subscribe(() => {
    root._closeValue = undefined;
    ref._begin(pending);
    pending = undefined;
  });

  // A dialog closed before it was ever shown has no exit and no focus to return.
  effect(
    () => {
      if (root.open() || root._mounted() || shown) return;
      untracked(finish);
    },
    { injector: container.injector },
  );

  return {
    requestClose: (result) => {
      if (config.closePredicate && !config.closePredicate(result, config, ref.componentInstance)) return;
      if (ref._begin(result)) root.open.set(false);
    },
    forceClose: () => {
      if (ref._begin(undefined)) root.open.set(false);
    },
  };
}
