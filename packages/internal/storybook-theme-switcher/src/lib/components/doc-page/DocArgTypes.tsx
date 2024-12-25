import { useOf } from '@storybook/addon-docs';
import { PreparedStory } from '@storybook/types';
import * as _ from 'lodash';
import  { useContext } from 'react';
import styled from 'styled-components';

import { deepMerge } from '@cocokits/common-utils';
import { ClassRef, UIBaseComponentsName } from '@cocokits/core';
import { CckThemeChangedEvent } from '@cocokits/storybook-theme-switcher';

import { DocArgTypesTable } from './DocArgTypesTable';
import { useArgTypesApiList, useArgTypesThemeApiList } from '../../utils/doc-page.utils';
import { DocsPageContext } from '../doc-page-container/DocPageContainer';

interface DocArgTypesProps {
  cckTheme: CckThemeChangedEvent
}

interface DocArgTypeProps {
  componentName: UIBaseComponentsName,
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

  const primaryComponentName = _.camelCase(title) as UIBaseComponentsName;
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
          const componentName = _.camelCase(componentRef.name.replace(/component$/i, '')) as UIBaseComponentsName;

          // Private component such as '_UiBaseComponent'
          if(componentName.startsWith('_')) {
            return;
          }

          /**
           * `extractArgTypes` is defined in compodoc, and it's only extract the component config and skip the storybook argTypes.
           * To fix that we created a custom structure in storybook argsType with then name of component and the args table.
           * ```
           * argTypes: {
           *     _MenuTriggerDirective: {
           *       menuOpen: { table: { defaultValue: { summary: 'false' } } }
           *     }
           *   },
           * ```
           * We will merge the compodoc types with our custom structure types to use both types at the sme time
           */
          const subcomponentTypes = deepMerge(
            resolved.preparedMeta.parameters['docs'].extractArgTypes(componentRef),
            resolved.preparedMeta.argTypes['_' + componentRef.prototype.constructor.name] ?? {}
          );

          /**
           * all storybook argTypes has a fix structure and the 'name' property exist for all of them.
           * ```
           *  {
           *     name: 'size',
           *     description: '...'
           *     table: {...},
           *     type: {...}
           *  }
           * ```
           * but because of our custom structure, the storybook will generate a type object with only name like this:
           * MenuTriggerDirective: {
           *  name: "MenuTriggerDirective",
           *  menuOpen: {...}
           * }
           * ```
           *
           * in this case the 'name' property in not a type definition, and it's only to detect the subcomponent argType.
           * So we have to remove it, otherwise the other part of the code, consider it as a artType,
           * and try to parse it to show the result as API table
           *
           * Summery:
           * Convert this structure
           * ```
           *   {
           *     name: 'THE NAME OF SUBCOMPONENT',
           *     type: {...},
           *     size: {...},
           *     color: {...},
           *     ...
           *   }
           * ```
           * to this:
           * ```
           *   {
           *     type: {...},
           *     size: {...},
           *     color: {...},
           *     ...
           *   }
           * ```
           */
          delete subcomponentTypes.name;

          return (
            <DocArgType key={subcomponent.toString()} componentName={componentName} argTypes={subcomponentTypes} cckTheme={cckTheme} hideComponentName={false}/>
          );
        })
      }
    </>
  );

}

export function DocArgType({componentName, argTypes, cckTheme, hideComponentName}: DocArgTypeProps) {
  const apiArgTypeList = useArgTypesApiList(componentName, argTypes, cckTheme.themeConfig);
  const themeApiArgTypeList = useArgTypesThemeApiList(componentName, cckTheme.themeConfig);

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