import {
  cloneVNode,
  Comment,
  createTextVNode,
  defineComponent,
  Fragment,
  Teleport,
  h,
  Text,
  type Component,
  type DefineComponent,
  type PropType,
  type VNode,
  type VNodeArrayChildren,
} from 'vue';
import { isDevelopment } from './dev';

/** A tag name for `as`. `'template'` merges onto the first element or component child like `asChild`. */
export type AsTag = 'a' | 'button' | 'div' | 'span' | 'template' | (string & Record<never, never>);

/** Props of the {@link Primitive}, the shape of Reka UI's `PrimitiveProps`. */
export interface PrimitiveProps {
  /**
   * Whether the attrs merge onto the first element or component child (text and comments are skipped) instead of rendering an element.
   *
   * @defaultValue false
   */
  readonly asChild?: boolean;
  /**
   * The tag or component to render. Ignored when `asChild` is set.
   *
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component;
  /**
   * Names of attrs that win over the child's own props with `asChild`. Used for state markers.
   *
   * @defaultValue []
   */
  readonly priorityAttrs?: readonly string[];
  /**
   * With `asChild`, the children the part puts inside the child, in place of the child's own. The callback
   * receives the child's own children (absent when called without them), so a part can keep them. The child
   * vnode is kept (its directives, `ref` and props), so only its children change. Ignored without `asChild`.
   *
   * @defaultValue undefined
   */
  readonly asChildContent?: ((hostChildren?: VNode[]) => VNode[]) | undefined;
}

/** The HTML void elements: they cannot have children, so they get no default slot. */
const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);
const IS_LISTENER = /^on[^a-z]/;

function flatten(nodes: readonly VNode[]): VNode[] {
  return nodes.flatMap((node) =>
    node.type === Fragment && Array.isArray(node.children) ? flatten(node.children as VNode[]) : [node],
  );
}

/** An element or component child; comments and text do not count. */
function isContent(node: VNode): boolean {
  return node.type !== Comment && node.type !== Text;
}

/** The attrs the child does not set itself, plus `class`, `style` and listeners, which merge. */
function attrsBelowChild(
  attrs: Record<string, unknown>,
  childProps: Record<string, unknown>,
  priority: readonly string[],
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (
      name === 'class' ||
      name === 'style' ||
      IS_LISTENER.test(name) ||
      priority.includes(name) ||
      !(name in childProps)
    ) {
      merged[name] = value;
    }
  }
  return merged;
}

/** A vnode with the scope ids of the slot it came from, which Vue sets but does not type. */
type ScopedVNode = VNode & { slotScopeIds?: string[] | null | undefined };

/** The own children of a vnode, whatever form they take: an array, a string, or the default slot of a component. */
function childrenOf(node: VNode): VNode[] {
  const { children } = node;
  if (Array.isArray(children)) return children as VNode[];
  if (typeof children === 'string') return [createTextVNode(children)];
  const slot = (children as { default?: () => VNode[] } | null)?.default;
  return slot ? slot() : [];
}

/**
 * The vnode with other children. It keeps what a compiled template put on it: directives, `ref`, key,
 * props and the scope ids. The children take the form of the type: an element or a built-in
 * `Teleport` takes an array; a component (also `Suspense` and `KeepAlive`) takes its default slot.
 * `Fragment`, `Comment` and `Text` never get here: fragments are flattened and `isContent` skips the rest.
 */
function withChildren(node: VNode, children: VNode[]): VNode {
  const asArray = typeof node.type === 'string' || node.type === Teleport;
  const replaced = h(node.type as string, node.props, asArray ? children : { default: () => children });
  replaced.dirs = node.dirs;
  replaced.ref = node.ref;
  replaced.scopeId = node.scopeId;
  // `slotScopeIds` is on every vnode but not in Vue's public `VNode` type.
  (replaced as ScopedVNode).slotScopeIds = (node as ScopedVNode).slotScopeIds;
  return replaced;
}

/**
 * Renders the attrs on the first element or component child. The child's own props win except the
 * `priority` ones, `class` and `style` merge, and listeners chain with the child's first. Warns in
 * development unless there is exactly one element or component child.
 */
function renderAsChild(
  children: readonly VNode[],
  attrs: Record<string, unknown>,
  priority: readonly string[],
  content?: (hostChildren?: VNode[]) => VNode[],
): VNode | VNodeArrayChildren | null {
  const nodes = flatten(children);
  if (isDevelopment() && nodes.filter(isContent).length !== 1) {
    console.warn('CocoKits: a part with asChild needs exactly one element or component child.');
  }
  const index = nodes.findIndex(isContent);
  const first = nodes[index];
  if (!first) return nodes.length > 0 ? nodes : null;
  const cloned = cloneVNode(
    content ? withChildren(first, content(childrenOf(first))) : first,
    attrsBelowChild(attrs, first.props ?? {}, priority),
  );
  if (nodes.length === 1) return cloned;
  return nodes.map((node, at) => (at === index ? cloned : node));
}

/**
 * The shared render primitive of the Vue parts. It renders `as` (a tag or a component, default
 * `'div'`), or, with `asChild`, merges its attrs onto the first element or component child. The HTML void elements
 * (`area`, `br`, `img`, `input`, ...) get no default slot. `as` is read at render time, so it can change at runtime.
 */
export const Primitive: DefineComponent<PrimitiveProps> = defineComponent({
  name: 'CckPrimitive',
  inheritAttrs: false,
  props: {
    asChild: { type: Boolean, default: false },
    as: { type: [String, Object, Function] as PropType<AsTag | Component>, default: 'div' },
    priorityAttrs: { type: Array as PropType<readonly string[]>, default: () => [] },
    asChildContent: { type: Function as PropType<(hostChildren?: VNode[]) => VNode[]>, default: undefined },
  },
  setup(props, { attrs, slots }): () => VNode | VNodeArrayChildren | null {
    return () => {
      const tag = props.asChild ? 'template' : (props.as ?? 'div');
      if (tag === 'template')
        return renderAsChild(slots['default']?.() ?? [], attrs, props.priorityAttrs ?? [], props.asChildContent);
      if (typeof tag === 'string' && VOID_TAGS.has(tag)) return h(tag, attrs);
      const content = { default: slots['default'] };
      // `h` has no overload for the `string | Component` union; both forms take the same arguments.
      return h(tag as string, attrs, content);
    };
  },
});
