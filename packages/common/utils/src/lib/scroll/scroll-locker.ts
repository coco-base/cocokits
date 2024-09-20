/** @module scroll */

type LockChangeCallback = (isLock: boolean) => void;

export class ScrollLocker {
  private static instance: ScrollLocker;

  private callbacks = new Set<LockChangeCallback>();

  public static globalInstance() {
    if (!ScrollLocker.instance) {
      ScrollLocker.instance = new ScrollLocker();
    }

    return ScrollLocker.instance;
  }

  public get isLocked() {
    return document.documentElement.style.position === 'fixed';
  }

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

  public addLockChangeListener(callback: (isLock: boolean) => void) {
    this.callbacks.add(callback);
  }

  public removeLockChangeListener(callback: (isLock: boolean) => void) {
    this.callbacks.delete(callback);
  }
}
