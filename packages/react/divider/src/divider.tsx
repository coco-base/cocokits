import { UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

interface DividerProps extends UIBaseComponentProps {
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: React.CSSProperties;
}

export function Divider(props: DividerProps) {
  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: 'divider',
    props,
    extraHostElementClassConditions: [{ if: !!props.className, classes: () => [props.className] }],
  });

  return <div className={hostClassNames} style={props.style} />;
}
