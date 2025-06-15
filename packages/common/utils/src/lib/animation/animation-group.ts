/** @module animation */

import { Animation } from './animation';
import { AnimationGroupConfig } from './animation.model';
import { AnimationFrameManager } from './animation-frame-manager';

const DEFAULT_CONFIG: AnimationGroupConfig = {
  disableInstance: false,
};

/**
 * AnimationGroup class for managing a group of animations.
 *
 * @example
 * const anim1 = new Animation(element1);
 * const anim2 = new Animation(element2);
 * const group = new AnimationGroup([anim1, anim2]);
 *
 * anim1.setTranslate({x: 100, y: 0});
 * anim2.setTranslate({x: 0, y: 100});
 * group.animate({ duration: 500 });
 */
export class AnimationGroup {
  private readonly config: AnimationGroupConfig;

  private animationDelayTimerId!: ReturnType<typeof setTimeout>;
  private frameManager!: AnimationFrameManager | null;

  private instances = new Set<Animation>();

  /**
   * Indicates whether any animation in the group is currently running.
   */
  public get isAnimating() {
    return !!this.frameManager?.isAnimating;
  }

  constructor(instances: Animation[] = [], config: Partial<AnimationGroupConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    instances.forEach((instance) => this.add(instance));
  }

  /**
   * Adds an animation instance to the group.
   *
   * @param instance - The Animation instance to add.
   * @example
   * const anim = new Animation(element);
   * const group = new AnimationGroup();
   * group.add(anim);
   */
  public add(instance: Animation) {
    const animation = instance instanceof Animation ? instance : Animation.getOrCreateInstance(instance);
    animation._disableAnimate = this.config.disableInstance;
    this.instances.add(animation);
  }

  /**
   * Removes an animation instance from the group.
   *
   * @param instance - The Animation instance to remove.
   * @example
   * const anim = new Animation(element);
   * const group = new AnimationGroup([anim]);
   * group.delete(anim);
   */
  public delete(instance: Animation) {
    const animation = instance instanceof Animation ? instance : Animation.getOrCreateInstance(instance);
    this.instances.delete(animation);
  }

  /**
   * Stops all animations in the group.
   */
  public stopAnimation() {
    this.instances.forEach((animation) => animation.stopAnimation());
    clearTimeout(this.animationDelayTimerId);
    this.frameManager?.cancel();
    this.frameManager = null;
  }

  /**
   * Applies all style changes to the DOM immediately for all animations in the group.
   */
  public applyImmediately() {
    this.instances.forEach((animation) => animation.applyImmediately());
  }

  /**
   * Applies all style changes to the DOM on the next requestAnimationFrame for all animations in the group.
   *
   * @returns A promise that resolves to true when the changes are applied.
   */
  public apply() {
    return new Promise<boolean>((resolve) => {
      this.stopAnimation();
      requestAnimationFrame(() => {
        this.applyImmediately();
        resolve(true);
      });
    });
  }

  /**
   * Animates all style changes to the DOM for all animations in the group.
   *
   * @param options - Animation options including duration, easing, and delay.
   * @returns A promise that resolves to true if the animation state is completed, otherwise false.
   */
  public async animate({ duration = 100, easing = (x: number) => x, delay = 0 } = {}): Promise<boolean> {
    if (duration <= 0) {
      return this.apply();
    }

    this.stopAnimation();

    return new Promise(async (resolve) => {
      // Handel Delay
      if (delay > 0) {
        this.animationDelayTimerId = setTimeout(async () => {
          const animateResult = await this.animate({ duration, easing });
          resolve(animateResult);
        }, delay);

        return;
      }

      const onAnimateFrame = Array.from(this.instances).map((animation) => animation._getAnimationFrameCallback(true));
      const hasValuesChanged = onAnimateFrame.some((callback) => callback !== null);

      if (!hasValuesChanged) {
        resolve(true);
        return;
      }

      this.frameManager = new AnimationFrameManager(duration, easing);
      const animateResult = await this.frameManager.animate((progress) =>
        onAnimateFrame.forEach((onProgress) => onProgress?.(progress))
      );
      this.frameManager = null;
      resolve(animateResult);
    });
  }
}
