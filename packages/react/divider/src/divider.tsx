import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";

interface DividerProps extends UIBaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Divider(props: DividerProps) {

  const { hostClassNames } = useUiBaseComponentConfig({
    componentName: "divider",
    props,
    extraHostElementClassConditions: [
      { if: !!props.className, classes: () => [props.className] },
    ]
  });


  return (
    <div className={hostClassNames} style={props.style}/>
  );
}