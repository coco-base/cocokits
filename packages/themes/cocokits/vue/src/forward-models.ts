import { camelize, getCurrentInstance } from 'vue';
import { isPropWritten } from '@cocokits/vue-core';

/**
 * The models of a themed root, handed to the base root the way the consumer wrote them. A model prop is passed only
 * when the consumer bound it, and its `update:` listener only when the consumer listens: the base root reads both
 * to decide between controlled, local state and its `default*` start value, so a wrapper that bound them itself
 * would make every themed root controlled by the wrapper and ignore `default-value` and `default-open`.
 *
 * @param props - The props of the themed root.
 * @param emitters - Per model name, the function that emits `update:<name>` on the themed root.
 * @returns A function that returns the bindings for the base root; call it in the template, where it is current.
 */
export function forwardModels(
  props: object,
  emitters: Readonly<Record<string, (value: never) => void>>,
): () => Record<string, unknown> {
  const instance = getCurrentInstance();
  const values = props as Record<string, unknown>;
  return () => {
    const listening = new Set(Object.keys(instance?.vnode.props ?? {}).map(camelize));
    const bindings: Record<string, unknown> = {};
    for (const [name, emitter] of Object.entries(emitters)) {
      if (isPropWritten(instance, name)) bindings[name] = values[name];
      if (listening.has(`onUpdate:${name}`)) {
        bindings[`onUpdate:${name}`] = emitter;
      }
    }
    return bindings;
  };
}
