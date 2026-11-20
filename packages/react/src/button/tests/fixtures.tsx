import { StrictMode, type ComponentProps, type ReactElement } from 'react';
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

/** A link component that renders an `<a>` and navigates unless the click was prevented. */
export function makeLink(navigate: (href: string) => void): (props: ComponentProps<'a'>) => ReactElement {
  return function LinkComponent({ onClick, href, ...rest }) {
    return (
      <a
        {...rest}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) navigate(href ?? '');
        }}
      />
    );
  };
}

export function strict(ui: ReactElement): ReactElement {
  return <StrictMode>{ui}</StrictMode>;
}
