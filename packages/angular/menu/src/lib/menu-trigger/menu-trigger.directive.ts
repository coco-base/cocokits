import { computed, Directive, ElementRef, inject, input, output, signal, TemplateRef } from '@angular/core';

import { UIComponentConfig } from '@cocokits/angular-core';
import { OverlayConfig, OverlayConnectElemOrigin, OverlayService, RenderedOverlay } from '@cocokits/angular-overlay';
import { getClassNames } from '@cocokits/core';

@Directive({
  standalone: true,
  selector: '[cckMenuTrigger]',
  host: {
    '(click)': 'onHostClick()',
  },
})
export class MenuTriggerDirective {
  private readonly menuOverlayClassNames = getClassNames('menu', {}, inject(UIComponentConfig)).overlay;
  private overlay = inject(OverlayService);
  private elemRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private renderedOverlay = signal<RenderedOverlay<void, void> | null>(null);

  /**
   * Readonly signal that present, whether the menu is open.
   */
  public menuOpen = computed(() => this.renderedOverlay() !== null);

  /**
   * The size of menu overlay, if not provided it will take the size of children elements
   */
  public menuSizes = input<OverlayConfig['size']>();

  public menuOrigin = input<OverlayConnectElemOrigin>(OverlayConnectElemOrigin.BottomRight);

  public menuTemplate = input.required<TemplateRef<any>>({ alias: 'cckMenuTrigger' });

  /**
   * Event emitted when the associated menu is opened.
   */
  menuOpened = output<void>();

  /**
   * Event emitted when the associated menu is closed.
   */
  menuClosed = output<void>();

  protected onHostClick() {
    this.openMenu();
  }

  /**
   * Closes the menu.
   */
  public closeMenu() {
    if (!this.menuOpen()) {
      return;
    }

    this.renderedOverlay()?.overlayRef.close();
    this.renderedOverlay.set(null);
  }

  /**
   * Opens the menu.
   */
  public openMenu() {
    if (this.menuOpen()) {
      return;
    }

    const renderedOverlay = this.overlay.open<void, void>(this.menuTemplate(), {
      panelClass: this.menuOverlayClassNames,
      size: this.menuSizes(),
      positionStrategy: {
        type: 'connectToElement',
        origin: this.menuOrigin(),
        connectTo: this.elemRef.nativeElement,
      },
    });

    this.renderedOverlay.set(renderedOverlay);
    this.menuOpened.emit();

    renderedOverlay.afterClose.then(() => {
      this.renderedOverlay.set(null);
      this.menuClosed.emit();
    });
  }

  /**
   * Toggles the menu between the open and closed states.
   */
  public toggleMenu() {
    this.menuOpen() ? this.closeMenu() : this.openMenu();
  }
}
