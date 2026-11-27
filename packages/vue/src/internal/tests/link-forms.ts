import { defineComponent, h, type Component, type VNode } from 'vue';

/** A router-link-like component that renders an `<a>` and navigates unless the click was prevented. */
export function makeLink(navigate: (href: string) => void): Component {
  return defineComponent({
    name: 'LinkStub',
    props: { to: { type: String, default: '' } },
    setup(props, { slots }) {
      return () =>
        h(
          'a',
          {
            href: props.to,
            onClick: (event: MouseEvent) => {
              if (!event.defaultPrevented) navigate(props.to);
            },
          },
          slots.default?.(),
        );
    },
  });
}

export interface Extras {
  /** Attrs and listeners on the Button. */
  readonly button?: Record<string, unknown>;
  /** A click listener on the element the Button merges onto, or renders through a component. */
  readonly element?: { readonly onClick?: () => void };
}
export type Link = (extras?: Extras) => VNode;

const text = (): (() => string) => () => 'Go';

/**
 * The four ways to render the Button (or another component with the Button's props, such as the IconButton) as a
 * link, each with the text "Go" and `href="#go"`.
 */
export function linkForms(LinkStub: Component, Control: unknown): readonly [string, Link][] {
  const Host = Control as Component;
  return [
    ['as="a"', ({ button } = {}) => h(Host, { as: 'a', href: '#go', ...button }, text())],
    [
      'asChild with an <a>',
      ({ button, element } = {}) =>
        h(Host, { asChild: true, ...button }, () => h('a', { href: '#go', ...element }, 'Go')),
    ],
    [
      'asChild with a component',
      ({ button, element } = {}) =>
        h(Host, { asChild: true, ...button }, () => h(LinkStub, { to: '#go', ...element }, () => 'Go')),
    ],
    ['as with a component', ({ button } = {}) => h(Host, { as: LinkStub, to: '#go', ...button }, text())],
  ];
}
