import {
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  TemplateRef,
} from '@angular/core';

import { ThemeConfigToken } from '@cocokits/angular-core';
import { OverlayConfig, OverlayConnectElemOrigin, OverlayService, RenderedOverlay } from '@cocokits/angular-overlay';
import { getClassNames } from '@cocokits/core';

@Directive({
  selector: '[cckMenuTrigger]',
  host: {
    '(click)': 'onHostClick()',
  },
})
export class MenuTriggerDirective {
  private readonly menuOverlayClassNames = getClassNames('menu', {}, inject(ThemeConfigToken)).overlay;
  private overlay = inject(OverlayService);
  private elemRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private renderedOverlay = signal<RenderedOverlay<void, void> | null>(null);

  /**
   * Readonly signal that present, whether the menu is open.
   */
  public menuOpen: Signal<boolean> = computed(() => this.renderedOverlay() !== null);

  /**
   * The size of menu overlay, if not provided it will take the size of children elements
   * @storybook argType will be overridden by storybook
   * TODO: Rename it to overlaySizes
   */
  public menuSizes = input<OverlayConfig['size']>();

  /**
   * The origin of menu position related to the target element
   */
  public menuOrigin: InputSignal<OverlayConnectElemOrigin> = input<OverlayConnectElemOrigin>(
    OverlayConnectElemOrigin.BottomRight
  );

  /**
   * References the menu instance ('ng-template') that contains the menu component.
   */
  public menuTemplate: InputSignal<TemplateRef<any>> = input.required<TemplateRef<any>>({ alias: 'cckMenuTrigger' });

  /**
   * Event emitted when the associated menu is opened.
   */
  menuOpened: OutputEmitterRef<void> = output<void>();

  /**
   * Event emitted when the associated menu is closed.
   */
  menuClosed: OutputEmitterRef<void> = output<void>();

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
      panelClass: [this.menuOverlayClassNames],
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
