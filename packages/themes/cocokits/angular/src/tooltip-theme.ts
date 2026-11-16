import { Directive, inject, input } from '@angular/core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { bindContentSize } from './overlay-size';

type TooltipOptions = CocokitsThemeConfig['components']['tooltip'];

/** The `size` values of the cocokits theme. */
export type CckTooltipSize = TooltipOptions['size']['values'][number];

/**
 * The cocokits theme option of the Tooltip root. It sits on the same element as the base root (`[cckTooltip]`) and
 * only holds `tooltipSize`; it provides nothing on that element, so a tooltip on a themed button keeps both themes.
 * The `cck-tooltip-content` of this tooltip reads it (see {@link CckTooltipContentTheme}). The name is `tooltipSize`,
 * not `size`, because the root is often on an element that has a `size` of its own, such as a button. The simple form
 * (`cckTooltip="text"` with no `cck-tooltip-content`) renders its bubble itself and shows the override or the default.
 *
 * @example
 * <ng-container cckTooltip tooltipSize="lg">
 *   <button cckTooltipTrigger type="button">Copy</button>
 *   <ng-template cckTooltipPortal><cck-tooltip-content>Copy the link</cck-tooltip-content></ng-template>
 * </ng-container>
 * @cckPart root
 */
@Directive({ selector: '[cckTooltip]' })
export class CckTooltipTheme {
  /**
   * Padding, width and text of the bubble, drawn on the content. It resolves in order: this input, then the
   * `provideCckTheme` override, then the config default; `null` removes the attribute.
   */
  readonly tooltipSize = input<CckTooltipSize | null>();
}

/**
 * The cocokits theme of the Tooltip content. It sits on the same element as the base content (`cck-tooltip-content`)
 * and writes its `data-size` from the `tooltipSize` of the root around it. The theme needs `provideCckTheme`; without it
 * no theme attribute renders.
 *
 * @example
 * <cck-tooltip-content>Copy the link</cck-tooltip-content>
 * @cckPart content
 */
@Directive({ selector: 'cck-tooltip-content' })
export class CckTooltipContentTheme {
  private readonly root = inject(CckTooltipTheme, { optional: true });

  constructor() {
    bindContentSize('tooltip', () => this.root?.tooltipSize());
  }
}
