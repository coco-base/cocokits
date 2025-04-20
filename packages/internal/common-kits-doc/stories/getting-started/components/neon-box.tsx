import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import styled from "styled-components";
import { useStaticText } from '@cocokits/react-utils';

interface NeonBoxProps {
  color?: 'brand' | 'purple';
  children?: ReactNode | ReactNode[];
  className?: string;
  style?: CSSProperties;
}

export function NeonBox({className, style, children, color = 'brand'}: NeonBoxProps) {

  const id = useStaticText();

  return (
    <StyledHost $color={color} className={className} style={style}>

      {children}

      <StyledSvg fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`backgroundGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--neon-box-bg-effect-start)"/>
            <stop offset="100%" stop-color="var(--neon-box-bg-effect-end)"/>
          </linearGradient>
          
          <linearGradient id={`borderGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--neon-box-border-1)"/>
            <stop offset="40%" stop-color="var(--neon-box-border-2)"/>
            <stop offset="60%" stop-color="var(--neon-box-border-3)"/>
            <stop offset="100%" stop-color="var(--neon-box-border-4)"/>
          </linearGradient>
        </defs>
        
        <rect
          x="0.5"
          y="0.5"
          width="99%" 
          height="99%"
          rx="24"
          fill={`url(#backgroundGradient-${id})`} 
          stroke={`url(#borderGradient-${id})`} 
          stroke-width="1" />
      </StyledSvg>

      <StyledEffectTop />
      <StyledEffectBottom />

      
    </StyledHost>
  );
}



const StyledHost = styled.div<{$color: 'brand' | 'purple'}>`

  .cck-theme-storybook-addon__color--dark & {
      --neon-box-bg-effect-start: ${({$color}) => $color === 'brand' ? 'rgba(18, 123, 86, 0.08)' : 'rgba(58, 129, 191, 0.08)'};
      --neon-box-bg-effect-end: ${({$color}) => $color === 'brand' ? 'rgba(114, 237, 192, 0.03)' : 'rgba(65, 48, 81, 0.03)'};
      --neon-box-border-1: ${({$color}) => $color === 'brand' ? 'rgba(60, 217, 160, 1)' : 'rgba(251, 55, 255, 1)'};
      --neon-box-border-2: ${({$color}) => $color === 'brand' ? 'rgba(18, 156, 105, 0)' : 'rgba(155, 111, 238, 0)'};
      --neon-box-border-3: ${({$color}) => $color === 'brand' ? 'rgba(18, 156, 105, 0)' : 'rgba(155, 111, 238, 0)'};
      --neon-box-border-4: ${({$color}) => $color === 'brand' ? 'rgba(60, 217, 160, 1)' : 'rgba(24, 178, 222, 1)'};
      --neon-box-bg-effect-top: ${({$color}) => $color === 'brand' ? 'rgba(18, 123, 86, 0.6)' : 'rgba(251, 55, 255, 0.4)'};
      --neon-box-bg-effect-bottom: ${({$color}) => $color === 'brand' ? 'rgba(114, 237, 192, 0.4)' : 'rgba(24, 178, 222, 0.6)'};
  }

  .cck-theme-storybook-addon__color--light & {
      --neon-box-bg-effect-start: ${({$color}) => $color === 'brand' ? 'rgba(0, 102, 68, 0.08)' : 'rgba(58, 129, 191, 0.08)'};
      --neon-box-bg-effect-end: ${({$color}) => $color === 'brand' ? 'rgba(0, 255, 255, 0.03)' : 'rgba(65, 48, 81, 0.03)'};
      --neon-box-border-1: ${({$color}) => $color === 'brand' ? 'rgba(173, 208, 194, 1)' : 'rgba(251, 55, 255, 1)'};
      --neon-box-border-2: ${({$color}) => $color === 'brand' ? 'rgba(0, 255, 171, 0)' : 'rgba(155, 111, 238, 0)'};
      --neon-box-border-3: ${({$color}) => $color === 'brand' ? 'rgba(0, 255, 171, 0)' : 'rgba(155, 111, 238, 0)'};
      --neon-box-border-4: ${({$color}) => $color === 'brand' ? 'rgba(173, 208, 194, 1)' : 'rgba(24, 178, 222, 1)'};
      --neon-box-bg-effect-top: ${({$color}) => $color === 'brand' ? 'rgba(0, 102, 68, 0.6)' : 'rgba(251, 55, 255, 0.4)'};
      --neon-box-bg-effect-bottom: ${({$color}) => $color === 'brand' ? 'rgba(0, 180, 120, 0.4)' : 'rgba(24, 178, 222, 0.6)'};
  }

  position: relative;
`;

const StyledSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
  pointer-events: none;
`;

const StyledEffectTop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  background-color: var(--neon-box-bg-effect-top);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  filter: blur(110px);
  touch-action: none;
  pointer-events: none;
  aspect-ratio: 1/1;
`;

const StyledEffectBottom = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 50%;
  background-color: var(--neon-box-bg-effect-bottom);
  border-radius: 50%;
  filter: blur(110px);
  touch-action: none;
  pointer-events: none;
  aspect-ratio: 1/1;
`;