import { camelize, type ComponentInternalInstance } from 'vue';

/**
 * Whether the parent wrote a prop on the component, whatever its value: `open`, `:open` and `model-value` for
 * `modelValue` all count, `undefined` included. Vue's own `useModel` asks the same question to tell a bound model from
 * an unbound one. The props of the component hold `undefined` for both an unwritten prop and one written as
 * `undefined`, so the check reads what the parent wrote.
 *
 * @param instance - The instance of the component (`getCurrentInstance()` in setup).
 * @param propName - The prop name in camel case (`modelValue`).
 * @returns `true` when the parent wrote the prop.
 */
export function isPropWritten(instance: ComponentInternalInstance | null, propName: string): boolean {
  const written = instance?.vnode.props;
  return written != null && Object.keys(written).some((key) => camelize(key) === propName);
}
