import { Directive, inject, input } from '@angular/core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { bindContentSize } from './overlay-size';

type DialogOptions = CocokitsThemeConfig['components']['dialog'];

/** The `size` values of the cocokits theme. */
export type CckDialogSize = DialogOptions['size']['values'][number];

/**
 * The cocokits theme option of the Dialog root. It sits on the same element as the base root (`[cckDialog]`) and
 * only holds `dialogSize`; it provides nothing on that element, so it never clashes with another theme directive
 * there. The `dialog[cckDialogContent]` of this dialog reads it (see {@link CckDialogContentTheme}). The name is
 * `dialogSize`, not `size`, because the root is often an `ng-container` or sits on an element that has a `size` of its
 * own.
 *
 * @example
 * <ng-container cckDialog dialogSize="lg">
 *   <button cckDialogTrigger type="button">Open</button>
 *   <ng-template cckDialogPortal>
 *     <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
 *   </ng-template>
 * </ng-container>
 * @cckPart root
 */
@Directive({ selector: '[cckDialog]' })
export class CckDialogTheme {
  /**
   * Width, padding and gap of the window, drawn on the content. It resolves in order: this input, then the
   * `provideCckTheme` override, then the config default; `null` removes the attribute. A dialog opened by
   * `CckDialogService` has no root directive and shows the override or the default.
   *
   * @cckSemantic dialog.size
   */
  readonly dialogSize = input<CckDialogSize | null>();
}

/**
 * The cocokits theme of the Dialog content. It sits on the same element as the base content
 * (`dialog[cckDialogContent]`) and writes its `data-size` from the `dialogSize` of the root around it. The theme
 * needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <dialog cckDialogContent><h2 cckDialogTitle>Delete project</h2></dialog>
 * @cckPart content
 */
@Directive({ selector: 'dialog[cckDialogContent]' })
export class CckDialogContentTheme {
  private readonly root = inject(CckDialogTheme, { optional: true });

  constructor() {
    bindContentSize('dialog', () => this.root?.dialogSize());
  }
}
