/** @module scroll */

type LockChangeCallback = (isLock: boolean) => void;

/**
 * A utility class that provides methods to lock and unlock scrolling on the page.
 * It also allows for the addition of callback functions to be notified whenever
 * the scroll lock state changes.
 *
 * `ScrollLocker` is designed as a singleton, providing a global instance to manage
 * scroll locking behavior across different parts of the application.
 *
 * ### Use Cases:
 * - **Overlay modals or popups**: When an overlay (such as a modal or a popup) is opened,
 *   users should not be able to scroll the underlying content.
 * - **Side navigation menus**: Locking the scroll when a side navigation menu is opened can
 *   prevent users from scrolling the main content.
 * - **Loading or confirmation screens**: In scenarios where a confirmation or loading screen
 *   appears, locking the scroll ensures users remain focused on the task at hand and do not
 *   scroll unintentionally.
 *
 * @example
 * ```typescript
 * const locker = ScrollLocker.globalInstance();
 * locker.lock(true);  // Locks the scroll and hides the scrollbar
 * locker.unlock();    // Unlocks the scroll
 * ```
 */
export class ScrollLocker {
  private static instance: ScrollLocker;

  private callbacks = new Set<LockChangeCallback>();

  /** @ignore */
  constructor() {
    //
  }

  /**
   * Returns the global instance of `ScrollLocker` ensuring a singleton pattern.
   *
   * @returns The global `ScrollLocker` instance.
   *
   * @example
   * ```typescript
   * const locker = ScrollLocker.globalInstance();
   * const locker2 = ScrollLocker.globalInstance();
   * locker.lock();      // Locks scrolling
   * locker2.isLocked(); // true
   * ```
   */
  public static globalInstance() {
    if (!ScrollLocker.instance) {
      ScrollLocker.instance = new ScrollLocker();
    }

    return ScrollLocker.instance;
  }

  /**
   * Determines whether scrolling is currently locked on the page.
   *
   * @returns `true` if scrolling is locked, otherwise `false`.
   *
   * @example
   * ```typescript
   * const isLocked = ScrollLocker.globalInstance().isLocked;
   * console.log(isLocked);  // Outputs: true or false
   * ```
   */
  public get isLocked() {
    return document.documentElement.style.position === 'fixed';
  }

  /**
   * Locks the scroll on the page, optionally hiding the scrollbar.
   *
   * **Note**: Hiding the scrollbar may cause a visible shift in content due to changes in
   * the body width, particularly when the content resizes.
   *
   * @param hideScrollbar Whether to hide the scrollbar when locking.
   *
   * - If `hideScrollbar` is `false`, the scrollbar remains visible, but the user cannot scroll.
   *   This is useful when you want to avoid changing the width of the body element to ensure
   *   that all elements stay in their original position. This method is ideal for cases where
   *   the overlay has a backdrop (like a modal) with opacity or no backdrop.
   *
   * - If `hideScrollbar` is `true`, the scrollbar is hidden, and the body width changes.
   *   This is beneficial for scenarios where a fullscreen overlay is in place, and the user
   *   cannot see the content behind the overlay. The size change in the body will be hidden behind
   *   the overlay, so the user will not notice any layout shift.
   *
   * @example
   * ```typescript
   * const locker = ScrollLocker.globalInstance();
   * locker.lock();     // Locks scroll with visible scrollbar
   * locker.lock(true); // Locks scroll and hides the scrollbar
   * ```
   */
  public lock(hideScrollbar = false) {
    if (this.isLocked) {
      return;
    }

    const body = document.body;
    const documentElement = document.documentElement;

    const hasBodyScrolled = body.scrollHeight > window.innerHeight || body.scrollWidth > window.innerWidth;

    if (hasBodyScrolled) {
      const documentRect = documentElement.getBoundingClientRect();

      const pageTop = 0;
      const pageLeft = 0;
      const top =
        -documentRect.top || document.body.scrollTop || window.scrollY || documentElement.scrollTop || pageTop;
      const left =
        -documentRect.left || document.body.scrollLeft || window.scrollX || documentElement.scrollLeft || pageLeft;

      documentElement.style.top = -top + 'px';
      documentElement.style.left = -left + 'px';

      documentElement.style.position = 'fixed';
      documentElement.style.width = '100%';

      hideScrollbar ? (documentElement.style.overflow = 'hidden') : (documentElement.style.overflowY = 'scroll');

      this.callbacks.forEach((callback) => callback(true));
    }
  }

  /**
   * Unlocks the scroll on the page, restoring the previous scroll position.
   * If the scroll is already unlocked, this function has no effect.
   *
   * @example
   * ```typescript
   * const locker = ScrollLocker.globalInstance();
   * locker.unlock();  // Unlocks scrolling and restores scroll position
   * ```
   */
  public unlock() {
    if (!this.isLocked) {
      return;
    }

    const documentElement = document.documentElement;
    documentElement.style.overflow = '';
    documentElement.style.overflowY = '';
    documentElement.style.position = '';
    documentElement.style.width = '';

    const pageTop = Math.abs(parseFloat(documentElement.style.top));
    const pageLeft = Math.abs(parseFloat(documentElement.style.left));
    documentElement.scrollTo({
      top: isNaN(pageTop) ? 0 : pageTop,
      left: isNaN(pageLeft) ? 0 : pageLeft,
    });

    documentElement.style.removeProperty('top');
    documentElement.style.removeProperty('left');
    documentElement.style.removeProperty('overflow');

    this.callbacks.forEach((callback) => callback(false));
  }

  /**
   * Adds a callback function that is invoked whenever the scroll lock state changes.
   *
   * @param callback A function that receives the current lock state (`true` for locked, `false` for unlocked).
   *
   * @example
   * ```typescript
   * const locker = ScrollLocker.globalInstance();
   * locker.addLockChangeListener((isLocked) => {
   *   console.log('Scroll locked:', isLocked);
   * });
   * ```
   */
  public addLockChangeListener(callback: (isLock: boolean) => void) {
    this.callbacks.add(callback);
  }

  /**
   * Removes a previously added scroll lock change listener.
   *
   * @param callback The listener function to be removed.
   *
   * @example
   * ```typescript
   * const locker = ScrollLocker.globalInstance();
   * locker.removeLockChangeListener(myCallback);
   * ```
   */
  public removeLockChangeListener(callback: (isLock: boolean) => void) {
    this.callbacks.delete(callback);
  }
}
