import { useOf } from '@storybook/blocks';

import { ClassRef } from '@cocokits/core';

import { StoryDocPageStylingSection } from './story-doc-page-styling-section';
import { AddonParameters } from '../../model/addon.model';

export function StoryDocPageStyling() {
  const resolved = useOf('meta');

  if (resolved.type !== 'meta') {
    return;
  }

  const parameters = resolved.preparedMeta.parameters as AddonParameters;
  const mainUiBaseComponentName = parameters.cckAddon?.componentName;
  const mainComponentName = (resolved.preparedMeta.component as ClassRef).name;

  if (!mainUiBaseComponentName) {
    throw new Error(`Component name is missing in the story parameters for story ID: ${resolved.preparedMeta.id}`);
  }
  if (!mainComponentName) {
    throw new Error(`Component is not a class ref in the story parameters for story ID: ${resolved.preparedMeta.id}`);
  }


  // Type of storybook is wrong, so we have to change it
  const subcomponentsRef = resolved.preparedMeta.subcomponents as unknown as ClassRef[] | undefined;

  const subcomponents =
    subcomponentsRef?.map((subcomponentRef) => {
      const subcomponentUIBaseComponentsName = parameters.cckAddon?.subcomponentNames?.[subcomponentRef.name];
      if (!subcomponentUIBaseComponentsName) {
        throw new Error(
          `Subcomponent name is missing in the story parameters for story ID: ${resolved.preparedMeta.id}/${subcomponentRef.name}`
        );
      }

      return {
        subcomponentUIBaseComponentsName,
        subcomponentComponentsName: subcomponentRef.name,
      };
    }) ?? [];

  

  return (
    <>
      {/* Description */}
      <p>
        This document outlines the CSS selectors used in the component, detailing their application contexts and the
        associated package names. This guide helps designers and developers understand when and how these selectors are
        applied to DOM elements.
      </p>

      {/* Main Component */}
      <StoryDocPageStylingSection componentName={mainComponentName} uiBaseComponentName={mainUiBaseComponentName} />

      {/* Subcomponents */}
      {subcomponents.length > 0 &&
        subcomponents.map((subcomponent) => (
          <StoryDocPageStylingSection
            key={subcomponent.subcomponentComponentsName}
            componentName={subcomponent.subcomponentComponentsName}
            uiBaseComponentName={subcomponent.subcomponentUIBaseComponentsName}
          />
        ))}
    </>
  );
}
