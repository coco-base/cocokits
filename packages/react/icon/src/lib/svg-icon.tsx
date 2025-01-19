import React, { forwardRef, useLayoutEffect, useRef } from "react";
import { UIBaseComponentProps } from "@cocokits/core";
import { useUiBaseComponentConfig } from "@cocokits/react-core";
import { ThemeSvgIcon } from "@cocokits/core";

export interface SvgIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'color' | 'type'>, UIBaseComponentProps {
  icon: ThemeSvgIcon | string;
}

export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(
  ({ icon, type, size, color, additional, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: "svgIcon",
      props: { type, size, color, additional },
    });

    const hostRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (typeof icon !== 'string' || !hostRef.current) {
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(icon, "image/svg+xml");

      if (doc.getElementsByTagName("parsererror").length) {
        throw new Error("Error parsing SVG string");
      }

      const svgElement = doc.getElementsByTagName("svg")[0];

      svgElement.classList.add(...classNames.svg.split(" "));
      hostRef.current.appendChild(svgElement);

      return () => {
        hostRef.current?.removeChild(svgElement);
      };
    }, [hostRef.current, icon, classNames.svg]);

    return (
      <div ref={hostRef} className={hostClassNames}>
        {typeof icon !== "string" && (
          <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={icon.viewBox}
            className={`${hostClassNames} ${classNames.svg}`}
            dangerouslySetInnerHTML={{ __html: icon.content }}
            {...restProps}
          />
        )}
      </div>
    )
  }
);

export default SvgIcon;
