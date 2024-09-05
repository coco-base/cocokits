import { useOf } from '@storybook/addon-docs';
import { PreparedStory } from '@storybook/types';
import * as _ from 'lodash';
import React, { useContext } from 'react';
import styled from 'styled-components';

import { ClassRef, UIComponentsName } from '@cocokits/core';
import { CckThemeChangedEvent } from '@cocokits/storybook-theme-switcher';

import { DocArgTypesTable } from './DocArgTypesTable';
import { useArgTypesApiList, useArgTypesThemeApiList } from '../../utils/doc-page.utils';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

interface DocArgTypesProps {
  cckTheme: CckThemeChangedEvent
}

interface DocArgTypeProps {
  componentName: UIComponentsName,
  argTypes: PreparedStory['argTypes'],
  cckTheme: CckThemeChangedEvent,
  hideComponentName: boolean
}

export function DocArgTypes({cckTheme}: DocArgTypesProps) {
  const resolved = useOf('meta');
  if(resolved.type !== 'meta') {
    return;
  }

  const { title } = useContext(DocsPageContext);

  const { argTypes, subcomponents } = resolved.preparedMeta;
  const primaryComponentName = _.camelCase(title) as UIComponentsName;
  const hasSubcomponents = !!subcomponents && Object.keys(subcomponents).length > 0;

  return (
    <>
      <DocArgType componentName={primaryComponentName} argTypes={argTypes} cckTheme={cckTheme} hideComponentName={false}/>

      {
        hasSubcomponents &&
        Object.values(subcomponents).map((subcomponent) => {
          const isComponentRef =  typeof subcomponent === 'function' && !!subcomponent.prototype && subcomponent.prototype.constructor === subcomponent;

          if(!isComponentRef) {
            return ;
          }

          const componentRef = subcomponent as ClassRef;
          const componentName = componentRef.name.replace(/component$/i, '') as UIComponentsName;

          // Private component such as '_UiBaseComponent'
          if(componentName.startsWith('_')) {
            return;
          }

          const subcomponentTypes = resolved.preparedMeta.parameters['docs'].extractArgTypes(componentRef);

          return (
            <DocArgType key={subcomponent.toString()} componentName={componentName} argTypes={subcomponentTypes} cckTheme={cckTheme} hideComponentName={false}/>
          );
        })
      }
    </>
  );

}

export function DocArgType({componentName, argTypes, cckTheme, hideComponentName}: DocArgTypeProps) {
  const apiArgTypeList = useArgTypesApiList(componentName, argTypes, cckTheme.uiComponentConfig);
  const themeApiArgTypeList = useArgTypesThemeApiList(componentName, cckTheme.uiComponentConfig);

  const isApiListEmpty =
    apiArgTypeList.props.length === 0 &&
    apiArgTypeList.methods.length === 0 &&
    apiArgTypeList.events.length === 0;

  const isThemApiListEmpty = themeApiArgTypeList ? themeApiArgTypeList?.length === 0 : true;

  if(isApiListEmpty && isThemApiListEmpty) {
    return (
      <>
        <StyledSpacer/>
        {!hideComponentName && <h3>{_.capitalize(componentName)} Component API</h3>}
        <StyledText>This components has no API configuration</StyledText>
      </>
    );
  }

  return (
    <>
      <StyledSpacer/>
      {!hideComponentName && <h3>{_.capitalize(componentName)} Component API</h3>}
      <DocArgTypesTable argTypesList={apiArgTypeList.props} header='Props' />
      <DocArgTypesTable argTypesList={apiArgTypeList.events} header='Events' hideDefault={true} />
      <DocArgTypesTable argTypesList={apiArgTypeList.methods} header='methods' hideDefault={true}/>

      {
        themeApiArgTypeList && themeApiArgTypeList.length > 0 &&
        <>
          <StyledSpacer/>
          {!hideComponentName && <h3>{_.capitalize(componentName)} {cckTheme.name} Theme API</h3>}
          <DocArgTypesTable argTypesList={themeApiArgTypeList} />
        </>
      }
    </>
  );
}

const StyledSpacer = styled.div`
    height: 1px;
    margin-top: 48px;
`;

const StyledText = styled.div`
    font: var(--cck-storybook-text-sm-regular);
    color: var(--cck-storybook-color-font-contrast-2);
`;