import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";


export interface TabProps extends UIBaseComponentProps {
  children: React.ReactNode | React.ReactNode[];
}

export const Tab = (props: TabProps) => {

  const { classNames, hostClassNames } = useUiBaseComponentConfig({
    componentName: 'tab',
    props,
    // extraHostElementClassConditions: [
    //   { if: true, classes: (classNames) => [''] }
    // ]
  });

  return (
    <>
      <div>Tab</div>
      {props.children}
    </>
  )
}