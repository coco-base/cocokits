import React, { forwardRef } from "react";
import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";
import { ThemeSvgIcon } from "@cocokits/core";

export interface SvgIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'color' | 'type'>, UIBaseComponentProps {
  icon: ThemeSvgIcon;
}

export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(
  ({ icon, type, size, color, additional, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: "svgIcon",
      props: { type, size, color, additional },
    });

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={icon.viewBox}
        className={`${hostClassNames} ${classNames.svg}`}
        dangerouslySetInnerHTML={{ __html: icon.content }}
        {...restProps}
      />
    );
  }
);

export default SvgIcon;
