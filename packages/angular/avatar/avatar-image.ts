import { DestroyRef, Directive, ElementRef, afterRenderEffect, computed, inject, input, output } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { getAvatarProps, watchImageLoadingStatus, type AvatarImageLoadingStatus } from '@cocokits/machines/avatar';
import { injectCckAvatar } from './avatar';

/**
 * The picture of an avatar. Put `cckAvatarImage` on a native `img`; the picture stays hidden until it has loaded, and then the fallback hides.
 *
 * After the first render, and again when `src` changes, the image is probed with a detached image. The probe also reads the `crossorigin` and `referrerpolicy` attributes of the `img`. No `src`, or an empty one, counts as an error. Every other attribute of the `img` (`alt`, `srcset`, `sizes`, `loading`) is yours.
 *
 * @example
 * <img cckAvatarImage [src]="user.picture" alt="Ada Lovelace" />
 * @cckPart image
 */
@Directive({
  selector: 'img[cckAvatarImage]',
  exportAs: 'cckAvatarImage',
  host: {
    '[class]': 'parts().class',
    '[attr.src]': 'src() ?? null',
    '[hidden]': 'parts().hidden === true',
  },
})
export class CckAvatarImage {
  /**
   * The address of the picture. When not set, or empty, the avatar shows its fallback.
   */
  readonly src = input<string | undefined>();

  /**
   * The loading status of the picture, each time it changes: `loading`, then `loaded` or `error`. It never reports `idle`, and never the same status twice in a row. It also reports the new status after `src` changes.
   */
  readonly loadingStatusChange = output<AvatarImageLoadingStatus>();

  private readonly root = injectCckAvatar('cckAvatarImage');
  private readonly element = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;
  private lastReported: AvatarImageLoadingStatus = 'idle';

  protected readonly parts = computed(() => getAvatarProps({ status: this.root._status() }).image);

  constructor() {
    bindAttrs(this.element, () => this.root._theme().image);
    this.root._registerImage();
    inject(DestroyRef).onDestroy(() => {
      this.root._unregisterImage();
      this.root._status.set('idle');
    });

    // Client only (after render), once per mount and per change of the source.
    afterRenderEffect((onCleanup) => {
      const src = this.src();
      const stop = watchImageLoadingStatus(
        {
          src,
          crossOrigin: this.element.getAttribute('crossorigin'),
          referrerPolicy: this.element.getAttribute('referrerpolicy'),
        },
        (status) => {
          this.root._status.set(status);
          if (status !== this.lastReported) {
            this.lastReported = status;
            this.loadingStatusChange.emit(status);
          }
        },
      );
      onCleanup(stop);
    });
  }
}
