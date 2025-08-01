import { StoryDocPageArgTypes } from './story-doc-page-api.model';
import { StoryDocPageApiTable } from './story-doc-page-api-table';
import { DocPageMarkdown } from '../doc-page/doc-page-markdown';
import { DocPageSection } from '../doc-page/doc-page-section';

export interface StoryDocPageAPIProps {
  argTypes: StoryDocPageArgTypes[];
  themeName: string;
  ngTemplateMD: string | null;
}

export function StoryDocPageAPI({ argTypes, themeName, ngTemplateMD }: StoryDocPageAPIProps) {
  const description = `Please verify that the \`${themeName}\` theme is also applied to your project to ensure consistency,
  or change the theme of this document page to align with your project settings.
  Mismatches between the theme of this document and your project can result in discrepancies in \`type\` definitions and \`default\` values,
  as themes may vary in their specifications.`;

  console.log('StoryDocPageAPI argTypes:', argTypes);
  
  return (
    <>
      <DocPageMarkdown>{description}</DocPageMarkdown>
      {argTypes.map((argType) => {
        const isEmpty =
          !argType.argTypeGroup ||
          Object.keys(argType.argTypeGroup).length === 0 ||
          (argType.argTypeGroup.props?.length === 0 &&
            argType.argTypeGroup.events?.length === 0 &&
            argType.argTypeGroup.methods?.length === 0);

        return (
          <DocPageSection
            id={argType.componentName}
            title={argType.componentName}
            description={argType.deception}
            key={argType.componentName}>
            {isEmpty && <p>This components has no API configuration</p>}

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
        );
      })}

      {ngTemplateMD && (
        <DocPageSection id="ng-template-doc" title="Templates">
          <DocPageMarkdown>{ngTemplateMD}</DocPageMarkdown>
        </DocPageSection>
      )}
    </>
  );
}
