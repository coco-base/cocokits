import {
  computed,
  inject,
  provide,
  toValue,
  type App,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from 'vue';
import type { Direction } from '@cocokits/shared';

export type { Direction };

/** Getter of the provided direction, so a changed value reaches the parts. @internal */
export const DIRECTION_KEY: InjectionKey<() => Direction> = Symbol('cck-direction');

/**
 * Sets the direction for a subtree or for the whole app. Call it in `setup` for a subtree, or pass the
 * app for the app-wide setting (`provideDirection('rtl', app)`).
 *
 * @param dir - The direction, a ref or a getter (a changed value reaches the parts).
 * @param app - The app to provide it on. Omit it to provide for the component calling this in `setup`.
 */
export function provideDirection(dir: MaybeRefOrGetter<Direction>, app?: App): void {
  const getDirection = (): Direction => toValue(dir);
  if (app) app.provide(DIRECTION_KEY, getDirection);
  else provide(DIRECTION_KEY, getDirection);
}

/**
 * Resolves the direction: the own prop, then the nearest `provideDirection`, then `'ltr'`. Call it
 * in `setup`.
 *
 * @param prop - The component's own `dir` prop; `undefined` defers to the provided direction.
 * @returns A computed direction; never throws without a provider.
 */
export function useDirection(prop?: MaybeRefOrGetter<Direction | undefined>): ComputedRef<Direction> {
  const provided = inject(DIRECTION_KEY, undefined);
  return computed(() => toValue(prop) ?? provided?.() ?? 'ltr');
}
