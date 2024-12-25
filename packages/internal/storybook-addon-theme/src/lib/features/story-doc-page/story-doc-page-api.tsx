import { useOf } from "@storybook/blocks";
import { useMemo } from "react";

import { getArgTypesApiList } from "./story-doc-page-api.utils";
import { StoryDocPageApiTable } from "./story-doc-page-api-table";
import { useTheme } from "../../utils/use-preview-theme";
import { DocPageMarkdown } from "../doc-page/doc-page-markdown";
import { DocPageSection } from "../doc-page/doc-page-section";


const getApiDescription = (themeName: string) =>
  `Please verify that the \`${themeName}\` theme is also applied to your project to ensure consistency,` +
  'or change the theme of this document page to align with your project settings.' +
  'Mismatches between the theme of this document and your project can result in discrepancies in `type`' +
  'definitions and `default` values,' +
  'as themes may vary in their specifications.';


export function StoryDocPageAPI() {  

  const {dispatchTheme, ...theme} = useTheme();
  const resolved = useOf('meta');

  if(resolved.type !== 'meta') {
    return;
  }

  const argTypes = useMemo(() => {

    return resolved.type === 'meta'
      ? getArgTypesApiList(resolved.preparedMeta, theme.themeConfig)
      : [];

  }, [theme.id, resolved.preparedMeta, resolved.type]);

  const deception = getApiDescription(theme.id);

  return (
    <>
      <DocPageMarkdown>{deception}</DocPageMarkdown>
      {
        argTypes.map((argType) => (
          <DocPageSection id={argType.componentName} title={argType.componentName} key={argType.componentName}>

            {
              (!argType.argTypeGroup || Object.keys(argType.argTypeGroup).length === 0) &&
              <p>This components has no API configuration</p>
            }

            {
              argType.argTypeGroup?.props && argType.argTypeGroup?.props.length > 0 && (
                <>
                  <h4>Properties</h4>
                  <StoryDocPageApiTable argTypes={argType.argTypeGroup.props}/>
                </>
              )
            }

            {
              argType.argTypeGroup?.events && argType.argTypeGroup?.events.length > 0 && (
                <>
                  <h4>Events</h4>
                  <StoryDocPageApiTable hideDefault={true} argTypes={argType.argTypeGroup.events}/>
                </>
              )
            }

            {
              argType.argTypeGroup?.methods && argType.argTypeGroup?.methods.length > 0 && (
                <>
                  <h4>Methods</h4>
                  <StoryDocPageApiTable hideDefault={true} argTypes={argType.argTypeGroup.methods}/>
                </>
              )
            }
          </DocPageSection>
        ))
      }
    </>
  );
}