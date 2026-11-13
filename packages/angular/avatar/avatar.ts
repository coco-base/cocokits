import { Directive, inject, signal } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { avatarAnatomy, type AvatarImageLoadingStatus } from '@cocokits/machines/avatar';

/**
 * Shows a person as a picture or, when there is no picture or it fails to load, as a fallback (initials or an icon). Put a `img[cckAvatarImage]` and a `cck-avatar-fallback` inside it.
 *
 * The root has no role. Give the image an `alt` with the person's name. For an avatar shown as initials or an icon, put `role="img"` and `aria-label` on the root. When the name is printed beside the avatar, hide the avatar with `aria-hidden="true"`. A clickable avatar goes inside a `button` or `a` that has its own name.
 *
 * It holds one image. A second image in development logs a `CocoKits:` warning.
 *
 * @example
 * <cck-avatar>
 *   <img cckAvatarImage src="/ada.webp" alt="Ada Lovelace" />
 *   <cck-avatar-fallback>AL</cck-avatar-fallback>
 * </cck-avatar>
 * @cckPart root
 * @cckSlot default - The image and the fallback. When not set, the avatar is empty.
 */
@Directive({
  selector: 'cck-avatar',
  exportAs: 'cckAvatar',
  host: {
    '[class]': 'class',
  },
})
export class CckAvatar {
  protected readonly class = avatarAnatomy.classes.root;

  /**
   * Whether the picture is ready. The image writes it; the parts read it.
   * @internal
   */
  readonly status = signal<AvatarImageLoadingStatus>('idle');

  private images = 0;
  private warned = false;

  constructor() {
    themeAttrs(avatarAnatomy); // applies the root part's theme attributes to the host
  }

  /**
   * Counts an image, and in development warns once when there is more than one.
   * @internal
   */
  registerImage(): void {
    this.images += 1;
    if (this.images > 1 && !this.warned && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      this.warned = true;
      console.warn('CocoKits: an Avatar can hold only one image. Remove the extra cckAvatarImage.');
    }
  }

  /** @internal */
  unregisterImage(): void {
    this.images -= 1;
  }
}

/**
 * Finds the avatar root of a part, or fails with a clear message.
 * @internal
 */
export function injectCckAvatar(part: string): CckAvatar {
  const root = inject(CckAvatar, { optional: true });
  if (!root) throw new Error(`CocoKits: ${part} must be placed inside a <cck-avatar>.`);
  return root;
}
