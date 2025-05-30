'use client';
import React, { CSSProperties, forwardRef, ReactNode, useLayoutEffect, useRef } from 'react';

import { ThemeSvgIcon, UIBaseComponentProps } from '@cocokits/core';
import { useUiBaseComponentConfig } from '@cocokits/react-core';

export interface SvgIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'color' | 'type'>, UIBaseComponentProps {
  /**
   * Input property that requires an SVG icon configuration or svg as string
   */
  icon: ThemeSvgIcon | string;
  /**
   * The content inside the component.
   * This can be a string, a number, an element, or an array of elements.
   * It allows rendering nested components within this component.
   */
  children?: ReactNode | ReactNode[];
  /**
   * A custom class name that can be used to apply additional styles to the component.
   */
  className?: string;
  /**
   * An object containing inline styles that can be used to customize the appearance of the component.
   */
  style?: CSSProperties;
}

export const SvgIcon = forwardRef<SVGSVGElement, SvgIconProps>(
  ({ icon, type, size, color, additional, className, ...restProps }, ref) => {
    const { classNames, hostClassNames } = useUiBaseComponentConfig({
      componentName: 'svgIcon',
      props: { type, size, color, additional },
      extraHostElementClassConditions: [{ if: !!className, classes: () => [className] }],
    });

    const hostRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
      if (typeof icon !== 'string' || !hostRef.current) {
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(icon, 'image/svg+xml');

      if (doc.getElementsByTagName('parsererror').length) {
        throw new Error('Error parsing SVG string');
      }

      const svgElement = doc.getElementsByTagName('svg')[0];

      svgElement.classList.add(...classNames.svg.split(' '));
      hostRef.current.appendChild(svgElement);

      return () => {
        hostRef.current?.removeChild(svgElement);
      };
    }, [hostRef.current, icon, classNames.svg]);

    return (
      <span ref={hostRef} className={hostClassNames}>
        {typeof icon !== 'string' && (
          <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={icon.viewBox}
            className={`${hostClassNames} ${classNames.svg}`}
            dangerouslySetInnerHTML={{ __html: icon.content }}
            {...restProps}
          />
        )}
      </span>
    );
  }
);

SvgIcon.displayName = 'SvgIcon';
export default SvgIcon;
