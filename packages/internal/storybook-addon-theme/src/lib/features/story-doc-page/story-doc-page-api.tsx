import { StoryDocPageArgTypes } from './story-doc-page-api.model';
import { StoryDocPageApiTable } from './story-doc-page-api-table';
import { DocPageMarkdown } from '../doc-page/doc-page-markdown';
import { DocPageSection } from '../doc-page/doc-page-section';

export interface StoryDocPageAPIProps {
  argTypes: StoryDocPageArgTypes[];
  themeName: string;
}

export function StoryDocPageAPI({ argTypes, themeName }: StoryDocPageAPIProps) {
  const description = `Please verify that the \`${themeName}\` theme is also applied to your project to ensure consistency,
  or change the theme of this document page to align with your project settings.
  Mismatches between the theme of this document and your project can result in discrepancies in \`type\` definitions and \`default\` values,
  as themes may vary in their specifications.`;

  return (
    <>
      <DocPageMarkdown>{description}</DocPageMarkdown>
      {argTypes.map((argType) => (
        <DocPageSection id={argType.componentName} title={argType.componentName} key={argType.componentName}>
          {(!argType.argTypeGroup || Object.keys(argType.argTypeGroup).length === 0) && (
            <p>This components has no API configuration</p>
          )}

          {argType.argTypeGroup?.props && argType.argTypeGroup?.props.length > 0 && (
            <>
              <h4>Properties</h4>
              <StoryDocPageApiTable argTypes={argType.argTypeGroup.props} />
            </>
          )}

          {argType.argTypeGroup?.events && argType.argTypeGroup?.events.length > 0 && (
            <>
              <h4>Events</h4>
              <StoryDocPageApiTable hideDefault={true} argTypes={argType.argTypeGroup.events} />
            </>
          )}

          {argType.argTypeGroup?.methods && argType.argTypeGroup?.methods.length > 0 && (
            <>
              <h4>Methods</h4>
              <StoryDocPageApiTable hideDefault={true} argTypes={argType.argTypeGroup.methods} />
            </>
          )}
        </DocPageSection>
      ))}
    </>
  );
}
