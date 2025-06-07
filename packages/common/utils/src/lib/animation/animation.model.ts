/** @module animation */

export interface Coordinate {
  x: number;
  y: number;
}

export interface TransformProperty extends Coordinate {
  scale: number;
  scaleX?: number;
  scaleY?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface AnimationProperties {
  transform: TransformProperty;
  dimension: Dimension;
  opacity: number;
}

export interface AnimateResult {
  state: AnimateState;
  changes?: Partial<AnimationProperties>; // only `Animating` state has changes
}

export enum AnimateState {
  Animating = 'animating',
  Completed = 'completed',
  Canceled = 'canceled',
}

export interface AnimationGroupConfig {
  disableInstance: boolean;
}
