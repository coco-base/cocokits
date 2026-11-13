import type { Component } from 'vue';
import type { AvatarImageLoadingStatus as MachineAvatarImageLoadingStatus } from '@cocokits/machines/avatar';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Whether the picture of an Avatar is ready.
 *
 * @cckValue idle - Nothing probed yet: the server render, the first client render, and an unmounted image.
 * @cckValue loading - The source is being fetched.
 * @cckValue loaded - The source loaded; the image shows and the fallback hides.
 * @cckValue error - There is no source, or it failed to load; the fallback shows.
 */
export type AvatarImageLoadingStatus = MachineAvatarImageLoadingStatus;

/**
 * A person shown as a picture or, when there is none or it fails to load, as a fallback. It renders a `<span>` that
 * holds an `AvatarImage` and an `AvatarFallback`. Native attributes fall through to the root.
 *
 * The root has no role. Give the `AvatarImage` an `alt` with the name of the person. For a fallback of initials or
 * an icon, put `role="img"` and an `aria-label` on the root. When the name is printed beside the avatar, as in an
 * `AvatarLabel`, hide the avatar with `aria-hidden="true"`.
 *
 * An avatar is not focusable and takes no key. To make one clickable, put it inside a `button` or an `a` that has
 * its own name.
 *
 * @example
 * <AvatarRoot>
 *   <AvatarImage src="/ada.webp" alt="Ada Lovelace" />
 *   <AvatarFallback>AL</AvatarFallback>
 * </AvatarRoot>
 *
 * @cckPart root
 */
export interface AvatarRootProps {
  /**
   * The tag or component to render in place of the `<span>`. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the class of the part. When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The picture of an Avatar: a native `<img>` that stays in the page and carries the native `hidden` attribute until
 * the picture has loaded. It must be inside an `AvatarRoot`, one image for each root; a second one logs a warning in
 * development.
 *
 * The element is always an `img`, so there is no `as` and no `asChild`. Native attributes such as `alt`, `srcset`,
 * `sizes` and `loading` fall through to it. The loading status is read with a detached image that uses only `src`,
 * `crossOrigin` and `referrerPolicy`.
 *
 * @example
 * <AvatarImage src="/ada.webp" alt="Ada Lovelace" @loading-status-change="(status) => (state = status)" />
 *
 * @cckPart image
 */
export interface AvatarImageProps {
  /**
   * The address of the picture. When not set or empty, the status is `error` and the fallback shows.
   *
   * @cckSemantic avatar.image.src
   * @cckParity Written on the `img` and probed after mount.
   */
  readonly src?: string | undefined;
  /**
   * The CORS mode of the picture, written on the `img` and copied to the probe. When not set, the picture loads
   * without a CORS request.
   *
   * @cckValue '' - The same as `anonymous`.
   * @cckValue anonymous - Request the picture with no credentials.
   * @cckValue use-credentials - Request the picture with cookies and other credentials.
   * @cckSemantic none
   * @cckParity A prop in this framework, written on the `img` as `crossorigin`.
   */
  readonly crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  /**
   * The referrer policy of the picture, written on the `img` and copied to the probe. When not set, the browser
   * default applies.
   *
   * @cckValue '' - The browser default.
   * @cckValue no-referrer - Send no referrer.
   * @cckValue no-referrer-when-downgrade - Send the referrer unless the request goes from https to http.
   * @cckValue origin - Send only the origin of the page.
   * @cckValue origin-when-cross-origin - Send the full address to the same origin, only the origin to others.
   * @cckValue same-origin - Send the referrer to the same origin only.
   * @cckValue strict-origin - Send only the origin, and nothing when the request goes from https to http.
   * @cckValue strict-origin-when-cross-origin - Send the full address to the same origin, the origin to others.
   * @cckValue unsafe-url - Always send the full address.
   * @cckSemantic none
   * @cckParity A prop in this framework, written on the `img` as `referrerpolicy`.
   */
  readonly referrerPolicy?: ReferrerPolicy | undefined;
}

/** The events of the AvatarImage. */
export interface AvatarImageEmits {
  /**
   * Emits the loading status of the picture each time it changes: `loading`, then `loaded` or `error`. It never
   * emits `idle`, never the same status twice in a row, and never during server render. A new `src` gives the next
   * sequence.
   *
   * @example
   * <AvatarImage src="/ada.webp" @loading-status-change="(status) => (state = status)" />
   *
   * @cckSemantic avatar.image.loadingStatusChange
   * @cckParity Emits `loadingStatusChange` with the new status.
   */
  loadingStatusChange: [status: AvatarImageLoadingStatus];
}

/**
 * Content shown while the picture is not loaded: initials, an icon or any content. It renders a `<span>` that stays
 * in the page and carries the native `hidden` attribute once the picture has loaded, or until `delayMs` has passed.
 * It must be inside an `AvatarRoot`.
 *
 * @example
 * <AvatarFallback :delay-ms="300">AL</AvatarFallback>
 *
 * @cckPart fallback
 */
export interface AvatarFallbackProps {
  /**
   * How many milliseconds to wait, after mount, before the fallback shows. When not set, it shows at once.
   *
   * @remarks Until the wait is over the fallback is hidden, also in the server render. A new value starts the wait
   * again.
   *
   * @cckSemantic avatar.fallback.delayMs
   * @cckParity Read after mount; the server render hides the fallback when it is set.
   */
  readonly delayMs?: number | undefined;
  /**
   * The tag or component to render in place of the `<span>`. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the class and the `hidden` attribute of the part. When not set, the part
   * renders its own element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
