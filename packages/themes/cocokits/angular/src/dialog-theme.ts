import { Directive, ElementRef, Renderer2, inject, input } from '@angular/core';
import { injectOverlayHost } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { bindContentSize } from './overlay-size';

type DialogOptions = CocokitsThemeConfig['components']['dialog'];

/** The `size` values of the cocokits theme. */
export type CckDialogSize = DialogOptions['size']['values'][number];

/**
 * The cocokits theme option of the Dialog root. It sits on the same element as the base root (the
 * `[cckDialogTriggerFor]` button that applies it, or the `ng-template cckDialog` of a dialog without a trigger) and only holds
 * `dialogSize`; it provides nothing on that element, so it never clashes with another theme directive there. The
 * `dialog[cckDialogContent]` of this dialog reads it (see {@link CckDialogContentTheme}). The name is `dialogSize`, not
 * `size`, because the root sits on an element that may have a `size` of its own.
 *
 * @example
 * <button type="button" [cckDialogTriggerFor]="deleteProject" dialogSize="lg">Open</button>
 * <ng-template #deleteProject>
 *   <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
 * </ng-template>
 * @cckPart root
 */
@Directive({ selector: 'button[cckDialogTriggerFor], ng-template[cckDialog]' })
export class CckDialogTheme {
  /**
   * Width, padding and gap of the window, drawn on the content. It resolves in order: this input, then the
   * `provideCckTheme` override, then the config default; `null` removes the attribute. A dialog opened by
   * `CckDialogService` has no root directive, so it shows the override or the default.
   *
   * @cckSemantic dialog.size
   */
  readonly dialogSize = input<CckDialogSize | null>();

  constructor() {
    // A static `dialogSize` would also stay on the trigger. A root on an `ng-template` has no element and no host
    // binding, so the attribute is removed here and only from an element.
    const host = inject<ElementRef<Node>>(ElementRef).nativeElement;
    if (host.nodeType === ELEMENT_NODE) inject(Renderer2).removeAttribute(host, 'dialogsize');
  }
}

/** `Node.ELEMENT_NODE`, which the server has no global for. */
const ELEMENT_NODE = 1;

/**
 * The cocokits theme of the Dialog content. It sits on the same element as the base content
 * (`dialog[cckDialogContent]`) and writes its `data-size` from the `dialogSize` on the element of its root. The theme
 * needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
 * @cckPart content
 */
@Directive({ selector: 'dialog[cckDialogContent]' })
export class CckDialogContentTheme {
  private readonly root = injectOverlayHost(CckDialogTheme);

  constructor() {
    bindContentSize('dialog', () => this.root?.dialogSize());
  }
}
