import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { CckButtonBase } from '@cocokits/angular/button';
import { getIconButtonProps, iconButtonAnatomy } from '@cocokits/machines/icon-button';
import { hasAccessibleName } from '@cocokits/utils';
import type { ButtonProps, ButtonRootProps } from '@cocokits/machines/button';

/**
 * Shared base of `CckIconButton` and `CckIconButtonAnchor`; it is not exported from the entry point. It is the
 * Button base with the Icon button anatomy and machine call, and the development check that something names the
 * element: an icon has no text, so the name comes from `aria-label` or `aria-labelledby`.
 */
@Directive()
export abstract class CckIconButtonBase extends CckButtonBase {
  constructor() {
    super();
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!hasAccessibleName(host)) {
        console.error(
          'CocoKits: an IconButton has no accessible name. Add an aria-label or an aria-labelledby that points to an element with text, or put a cck-svg-icon with a label inside.',
        );
      }
    });
  }

  protected override themeAnatomy(): typeof iconButtonAnatomy {
    return iconButtonAnatomy;
  }

  protected override machineProps(props: ButtonProps): ButtonRootProps {
    return getIconButtonProps(props);
  }
}
