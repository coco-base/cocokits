/** @module _hidden */

import { isNotNullish, isNullish } from '../ensure/ensure-nullish';

export class AnimationFrameManager {
  private readonly duration: number;
  private readonly easing: (frame: number) => number;

  /**
   * Animation Start Time
   *
   * This property holds the time at which the animation started. It is used to calculate the animation's progress over time.
   */
  private startTime!: number | null;

  /**
   * The ID of the current animation frame.
   *
   * This ID is used to cancel the animation frame requests.
   */
  private animationFrameId!: number | null;

  /**
   * A callback function to resolve the animation promise.
   *
   * This is utilized for resolving the promise when the animation is manually stopped.
   */
  private resolveAnimationPromise: ((isCompleted: boolean) => void) | null = null;

  /**
   * Check if Animation is Active
   *
   * Returns true if the animation is currently in progress.
   */
  public get isAnimating() {
    return isNotNullish(this.startTime);
  }

  constructor(duration = 300, easing = (frame: number) => frame) {
    this.duration = duration;
    this.easing = easing;
  }

  /**
   * Cancel Animation
   *
   * This method stops the ongoing animation.
   */
  public cancel() {
    if (isNotNullish(this.animationFrameId)) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.resolveAnimationPromise?.(false);
    this.clearStates();
  }

  /**
   * Clear Animation States
   *
   * Resets all the internal state properties of the animation,
   * preparing it for a fresh start or complete termination.
   */
  private clearStates() {
    this.animationFrameId = null;
    this.resolveAnimationPromise = null;
    this.startTime = null;
  }

  /**
   * Animate with Callback
   *
   * Executes the animation using a callback function to report progress.
   *
   * @param callback - The function to call with the progress of the animation.
   * @returns A promise that resolves when the animation is either completed or cancelled.
   */
  public async animate(callback: (progress: number) => void): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolveAnimationPromise = resolve;
      const _animate = (time: number) => {
        if (isNullish(this.startTime)) {
          throw new Error('Start time of animation can not be nullish');
        }

        const frame = Math.min(1, (time - this.startTime) / this.duration);
        const progress = this.easing(frame);

        callback(progress);

        if (frame === 1) {
          this.clearStates();
          resolve(true);
          return;
        }

        this.animationFrameId = requestAnimationFrame(_animate);
      };

      /**
       * Initialize Animation
       *
       * This section sets up the initial animation frame.
       * The 'time' parameter represents the current time at the start of the animation cycle.
       * On the first 'requestAnimationFrame', it initializes the 'startTime' property with this 'time' value.
       * This setup is crucial for accurately calculating
       * the progress of the animation in subsequent frames. The animation then proceeds with the '_animate' function call.
       */
      this.animationFrameId = requestAnimationFrame((time) => {
        this.startTime = time;
        this.animationFrameId = requestAnimationFrame(_animate);
      });
    });
  }
}
