/** @module animation */
import { lastValueFrom, Observable, ReplaySubject } from 'rxjs';

import { AnimateResult, AnimateState, AnimationProperties, Coordinate, Dimension } from './animation.model';
import { getAnimationValueOnProgress, getTransform2dValue } from './animation.util';
import { AnimationFrameManager } from './animation-frame-manager';
import { AnimationStore } from './animation-store';
import { getObjectDiff } from '../differs/simple-object-diff';
import { hasNotValue } from '../ensure/ensure-value';
import { deepClone } from '../uncategorized/deep-clone';
import { clamp } from '../uncategorized/math';

export type Callback<T> = (data: T) => void;

interface AnimationState {
  properties: AnimationProperties;
  previousProperties: AnimationProperties;
}

/**
 * Animation class for handling element animations.
 *
 * @example
 * // For always creating new instances:
 * const anim1 = new Animation(element1); // Returns a new instance for element1
 * const anim2 = new Animation(element1); // Returns another new instance for element1
 *
 * // For singleton instances per HTMLElement, use the getOrCreateInstance method:
 * const anim1 = Animation.getOrCreateInstance(element1); // Returns a new instance for element1, as none exists yet
 * const anim2 = Animation.getOrCreateInstance(element1); // Returns the existing instance for element1, anim1 and anim2 are now the same
 * const anim3 = Animation.getOrCreateInstance(element2); // Returns a new instance for element2, as none exists yet
 */
export class Animation {
  private static instances: Map<HTMLElement, Animation> = new Map();
  private callbacks = new Set<Callback<AnimationProperties>>();

  private state: AnimationStore<AnimationState>;
  private frameManager!: AnimationFrameManager | null;

  private element: HTMLElement;

  private animationDelayTimerId!: NodeJS.Timeout;

  public get value() {
    return this.state.value.properties;
  }

  public get actualValue() {
    return this.state.value.previousProperties;
  }

  public get isAnimating() {
    return !!this.frameManager?.isAnimating;
  }

  /**
   * @internal Internal implementation detail, do not use directly
   */
  public _disableAnimate = false;

  constructor(element: HTMLElement) {
    this.element = element;
    Animation.instances.set(element, this);

    const currentOpacity = window.getComputedStyle(element).opacity;
    const properties: AnimationProperties = {
      transform: { x: 0, y: 0, scale: 1, rotateX: 0, rotateY: 0 },
      dimension: {
        width: element.offsetWidth,
        height: element.offsetHeight,
      },
      opacity: currentOpacity === '' ? 1 : Number(currentOpacity),
    };

    this.state = new AnimationStore({
      properties,
      previousProperties: deepClone(properties),
      isAnimating: false,
    });
  }

  private emit() {
    this.callbacks.forEach((fn) => fn(this.value));
  }

  /**
   * Returns the singleton instance of Animation for a given element
   */
  public static getOrCreateInstance(element: HTMLElement): Animation {
    if (!Animation.instances.has(element)) {
      Animation.instances.set(element, new Animation(element));
    }
    return Animation.instances.get(element) as Animation;
  }

  // region --- Values ---
  public addValueChangeListener(fn: Callback<AnimationProperties>) {
    this.callbacks.add(fn);
  }

  public removeValueChangeListener(fn: Callback<AnimationProperties>) {
    this.callbacks.delete(fn);
  }

  public addTranslate({ x = 0, y = 0 }: Partial<Coordinate>) {
    const transform = {
      x: this.state.value.properties.transform.x + x,
      y: this.state.value.properties.transform.y + y,
    };
    this.state.deepSet({ properties: { transform } });
    return this;
  }

  public setTranslate(transform: Partial<Coordinate>) {
    const x = transform.x ?? this.state.value.properties.transform.x;
    const y = transform.y ?? this.state.value.properties.transform.y;
    this.state.deepSet({ properties: { transform: { x, y } } });
    return this;
  }

  public addDimension({ width = 0, height = 0 }: Partial<Dimension>) {
    const dimension = {
      width: this.state.value.properties.dimension.width + width,
      height: this.state.value.properties.dimension.height + height,
    };
    this.state.deepSet({ properties: { dimension } });
    return this;
  }

  public setDimension(dimension: Partial<Dimension>) {
    const width = dimension.width ?? this.state.value.properties.dimension.width;
    const height = dimension.height ?? this.state.value.properties.dimension.height;
    this.state.deepSet({ properties: { dimension: { width, height } } });
    return this;
  }

  public flipX() {
    const rotateX = this.state.value.properties.transform.rotateX === 180 ? 0 : 180;
    this.state.deepSet({ properties: { transform: { rotateX } } });
    return this;
  }

  public flipY() {
    const rotateY = this.state.value.properties.transform.rotateY === 180 ? 0 : 180;
    this.state.deepSet({ properties: { transform: { rotateY } } });
    return this;
  }

  public setScale(scale: number | undefined | null) {
    if (hasNotValue(scale)) {
      return this;
    }
    this.state.deepSet({ properties: { transform: { scale: scale as number } } });
    return this;
  }

  public setOpacity(opacity: number | undefined | null) {
    if (hasNotValue(opacity)) {
      return this;
    }
    const boundedOpacity = clamp(opacity as number, [0, 1]);
    this.state.deepSet({ properties: { opacity: boundedOpacity } });
    return this;
  }

  // endregion

  // region --- animate ----

  public stopAnimation() {
    clearTimeout(this.animationDelayTimerId);
    this.frameManager?.cancel();
    this.frameManager = null;
  }

  /**
   * Apply all style changes to the DOM immediately.
   * @return The changes that applied to the DOM
   */
  public applyImmediately(): Partial<AnimationProperties> {
    const changesValues = getObjectDiff(this.state.value.previousProperties, this.state.value.properties);

    if (changesValues.transform !== undefined) {
      this.element.style.transform = getTransform2dValue(this.state.value.properties.transform);
    }

    if (changesValues.dimension?.width !== undefined) {
      this.element.style.width = `${this.state.value.properties.dimension.width}px`;
    }

    if (changesValues.dimension?.height !== undefined) {
      this.element.style.height = `${this.state.value.properties.dimension.height}px`;
    }

    if (changesValues.opacity !== undefined) {
      this.element.style.opacity = String(this.state.value.properties.opacity);
    }

    if (Object.keys(changesValues).length > 0) {
      this.emit();
    }

    this.state.deepSet({ previousProperties: deepClone(this.state.value.properties) });

    return changesValues;
  }

  /**
   * Apply all style changes to the DOM on the next requestAnimationFrame.
   * @return A promise of changes that applied to the DOM
   */
  public apply(): Promise<Partial<AnimationProperties>> {
    if (this._disableAnimate) {
      return Promise.resolve({});
    }

    return new Promise<Partial<AnimationProperties>>((resolve) => {
      this.stopAnimation();
      requestAnimationFrame(() => {
        const changes = this.applyImmediately();
        resolve(changes);
      });
    });
  }

  public _getAnimationFrameCallback(isAnimationGroup = false) {
    const valueOnStart = deepClone(this.state.value.previousProperties);
    const valueOnEnd = deepClone(this.state.value.properties);

    if (Object.keys(getObjectDiff(valueOnStart, valueOnEnd)).length === 0) {
      return null;
    }

    return (progress: number): Partial<AnimationProperties> => {
      this.state.deepSet({
        properties: {
          transform: {
            x: getAnimationValueOnProgress(progress, valueOnStart.transform.x, valueOnEnd.transform.x),
            y: getAnimationValueOnProgress(progress, valueOnStart.transform.y, valueOnEnd.transform.y),
            scale: getAnimationValueOnProgress(progress, valueOnStart.transform.scale, valueOnEnd.transform.scale),
            rotateX: getAnimationValueOnProgress(
              progress,
              valueOnStart.transform.rotateX,
              valueOnEnd.transform.rotateX
            ),
            rotateY: getAnimationValueOnProgress(
              progress,
              valueOnStart.transform.rotateY,
              valueOnEnd.transform.rotateY
            ),
          },
          dimension: {
            width: getAnimationValueOnProgress(progress, valueOnStart.dimension.width, valueOnEnd.dimension.width),
            height: getAnimationValueOnProgress(progress, valueOnStart.dimension.height, valueOnEnd.dimension.height),
          },
          opacity: getAnimationValueOnProgress(progress, valueOnStart.opacity, valueOnEnd.opacity),
        },
      });

      return isAnimationGroup || !this._disableAnimate ? this.applyImmediately() : {};
    };
  }

  /**
   * Animate all style changes to the DOM.
   * @return An Observable of changes on each frame, that apply to the DOM
   */
  public animate$({ duration = 100, easing = (x: number) => x, delay = 0 } = {}): Observable<AnimateResult> {
    const changesSubject$ = new ReplaySubject<AnimateResult>();
    const changes$ = changesSubject$.asObservable();

    if (duration <= 0) {
      this.apply().then((changes) => {
        changesSubject$.next({ state: AnimateState.Animating, changes });
        changesSubject$.next({ state: AnimateState.Completed });
        changesSubject$.complete();
      });
      return changes$;
    }

    this.stopAnimation();

    if (delay > 0) {
      this.animationDelayTimerId = setTimeout(async () => {
        this.animate$({ duration, easing }).subscribe({
          next: (animationResult) => changesSubject$.next(animationResult),
          complete: () => changesSubject$.complete(),
        });
      }, delay);

      return changes$;
    }

    const onAnimateFrame = this._getAnimationFrameCallback();

    if (!onAnimateFrame) {
      changesSubject$.next({ state: AnimateState.Completed });
      changesSubject$.complete();
      return changes$;
    }

    this.frameManager = new AnimationFrameManager(duration, easing);
    this.frameManager
      .animate((progress) => {
        const changes = onAnimateFrame(progress);
        changesSubject$.next({ state: AnimateState.Animating, changes });
      })
      .then((isCompleted) => {
        this.frameManager = null;
        changesSubject$.next({ state: isCompleted ? AnimateState.Completed : AnimateState.Canceled });
        changesSubject$.complete();
      });

    return changes$;
  }

  /**
   * Animate all style changes to the DOM.
   * @return A promise that resolves to true if the animation state is completed, otherwise false
   */
  public async animate({ duration = 100, easing = (x: number) => x, delay = 0 } = {}): Promise<boolean> {
    const result = await lastValueFrom(this.animate$({ duration, easing, delay }));
    return result.state === AnimateState.Completed;
  }
  // endregion
}
