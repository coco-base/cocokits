import { DocsContext, useOf } from '@storybook/blocks';
import { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getInstance } from '@cocokits/common-utils';
import { TabOld, TabSelectionChangeEventOld,TabsOld } from '@cocokits/react-tabs-old';
import { usePromise } from '@cocokits/react-utils';

import { getApiProps, getOverviewProps, getStylingProps } from './story-doc-page.utils';
import { StoryDocPageAPI } from './story-doc-page-api';
import { StoryDocPageExamples } from './story-doc-page-examples';
import { StoryDocPageOverview } from './story-doc-page-overview';
import { StoryDocPageStyling } from './story-doc-page-styling';
import { AddonConfig } from '../../data-access/addon-config/preview-addon-config';
import { GlobalEvent } from '../../data-access/global-event/preview-global-event';
import { AddonParameters } from '../../model/addon.model';
import { useTheme } from '../../utils/use-preview-theme';
import { DocPage } from '../doc-page/doc-page';
import { DocTocItem } from '../doc-page/doc-page-toc';

export type StoryTab = 'Overview' | 'API' | 'Styling' | 'Examples';

export function StoryDocPage() {
  const [selectedTab, setSelectedTab] = useState<StoryTab>('Overview');

  const theme = useTheme();
  const { result: config } = usePromise(getInstance(AddonConfig).getAddonConfig);

  const context = useContext(DocsContext);
  const resolved = useOf('meta');

  if (resolved.type !== 'meta') {
    return;
  }

  const { overviewProps, title, breadcrumb, apiProps, stylingProps, tocItemsMap } = useMemo(() => {
    if (!config) {
      return {};
    }
    const stories = context.componentStories();
    const primaryStory = stories[0];
    const parameters = primaryStory.parameters as AddonParameters;

    const _overviewProps = getOverviewProps(parameters, stories, theme);
    const _apiProps = getApiProps(resolved.preparedMeta, theme, config.framework);
    const _stylingProps = getStylingProps(resolved.preparedMeta, parameters);

    const _tocItemsMap = {
      Overview: _overviewProps.stories.map((story) => ({ id: story.id, name: story.name })),
      API: [
        ..._apiProps.argTypes.map((argType) => ({ id: argType.componentName, name: argType.componentName })),
        ...(parameters.cckAddon.ngTemplateMarkdown ? [{ id: 'ng-template-doc', name: 'Templates' }] : []),
      ],
      Styling: [_stylingProps.mainComponent, ..._stylingProps.subcomponents].map((component) => ({
        id: component.componentName,
        name: component.componentName,
      })),
      Examples: [],
    } satisfies Record<'Overview' | 'API' | 'Styling' | 'Examples', DocTocItem[]>;

    return {
      title: primaryStory.title.split('/').at(-1), // UI Components/Button -> Button
      breadcrumb: primaryStory.title.split('/')[0], // UI Components/Button -> UI Components
      overviewProps: _overviewProps,
      apiProps: _apiProps,
      stylingProps: _stylingProps,
      tocItemsMap: _tocItemsMap,
    };
  }, [theme.id, config?.framework]);

  if (!overviewProps || !apiProps || !stylingProps || !tocItemsMap || !title || !breadcrumb) {
    return null;
  }

  const onTabChange = (event: TabSelectionChangeEventOld) => {
    const tabName = event.value as StoryTab;
    getInstance(GlobalEvent).dispatch.docTabChange({ tabName });
    setSelectedTab(tabName);
  };

  return (
    <DocPage breadcrumb={breadcrumb} title={title} tocItems={tocItemsMap[selectedTab]}>
      <StyledTabs selectedValue={selectedTab} onSelectionChange={onTabChange}>
        <TabOld label="Overview" value="Overview">
          <StoryDocPageOverview {...overviewProps} />
        </TabOld>

        <TabOld label="API" value="API">
          <StoryDocPageAPI {...apiProps} />
        </TabOld>

        <TabOld label="Styling" value="Styling">
          <StoryDocPageStyling {...stylingProps} />
        </TabOld>

        <TabOld label="Examples" value="Examples">
          <StoryDocPageExamples />
        </TabOld>
      </StyledTabs>
    </DocPage>
  );
}

const StyledTabs = styled(TabsOld)`
  & .doc-cck-tabs__content-wrapper {
    margin-top: 28px;
  }
`;
