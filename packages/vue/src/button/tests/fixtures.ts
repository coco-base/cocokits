import { defineComponent, h, type Component, type VNode } from 'vue';
import { Button } from '../index';
import { defineThemeConfig, type ThemeConfig } from '@cocokits/shared';

/** A small theme config with the three Button options of the cocokits theme. */
export const testThemeConfig: ThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    button: {
      variant: { attrName: 'variant', values: ['primary', 'ghost'], default: 'primary' },
      color: { attrName: 'cck-color', values: ['brand', 'danger'], default: 'brand' },
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md' },
    },
  },
});

export { mountView, view } from '../../internal/tests/mount-helpers';

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

/** The four ways to render the Button as a link, each with the text "Go" and `href="#go"`. */
export function linkForms(LinkStub: Component): readonly [string, Link][] {
  return [
    ['as="a"', ({ button } = {}) => h(Button, { as: 'a', href: '#go', ...button }, text())],
    [
      'asChild with an <a>',
      ({ button, element } = {}) =>
        h(Button, { asChild: true, ...button }, () => h('a', { href: '#go', ...element }, 'Go')),
    ],
    [
      'asChild with a component',
      ({ button, element } = {}) =>
        h(Button, { asChild: true, ...button }, () => h(LinkStub, { to: '#go', ...element }, () => 'Go')),
    ],
    ['as with a component', ({ button } = {}) => h(Button, { as: LinkStub, to: '#go', ...button }, text())],
  ];
}
