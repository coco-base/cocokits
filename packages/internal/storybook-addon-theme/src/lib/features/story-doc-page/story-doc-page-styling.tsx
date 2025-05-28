import { UIBaseComponentsName } from '@cocokits/core';

import { StoryDocPageStylingSection } from './story-doc-page-styling-section';

export interface StoryDocPageStylingComponent {
  uIBaseComponentName: UIBaseComponentsName;
  componentName: string;
}

export interface StoryDocPageStylingProps {
  mainComponent: StoryDocPageStylingComponent;
  subcomponents: StoryDocPageStylingComponent[];
}

export function StoryDocPageStyling({ mainComponent, subcomponents }: StoryDocPageStylingProps) {
  return (
    <>
      {/* Description */}
      <p>
        This document outlines the CSS selectors used in the component, detailing their application contexts and the
        associated package names. This guide helps designers and developers understand when and how these selectors are
        applied to DOM elements.
      </p>

      {/* Main Component */}
      <StoryDocPageStylingSection
        componentName={mainComponent.componentName}
        uiBaseComponentName={mainComponent.uIBaseComponentName}
      />

      {/* Subcomponents */}
      {subcomponents.length > 0 &&
        subcomponents.map((subcomponent) => (
          <StoryDocPageStylingSection
            key={subcomponent.componentName}
            componentName={subcomponent.componentName}
            uiBaseComponentName={subcomponent.uIBaseComponentName}
          />
        ))}
    </>
  );
}
