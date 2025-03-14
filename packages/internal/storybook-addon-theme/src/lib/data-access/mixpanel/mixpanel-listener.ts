import events from '@storybook/core/core-events';
import { addons } from '@storybook/manager-api';
import { findKey, kebabCase } from 'lodash';
import { filter, map, Observable, of, OperatorFunction, startWith, switchMap, take } from 'rxjs';

import { getInstance } from '@cocokits/common-utils';

import { MixpanelEventData, MixpanelEvents, StorybookPageCategories } from './mixpanel.model';
import {
  EventDocExampleToggle,
  EventDocOverviewSourceToggle,
  EventDocTabChange,
  EVENTS,
} from '../../config/events.config';
import { ThemeChangeEvent } from '../../model/event.model';
import { fromStorybookEvent } from '../../utils/rxjs.util';
import { GlobalEvent } from '../global-event/manager-global-event';
import { LocalStorage } from '../local-storage';
import { DocExampleToggle, DocOverviewSourceToggle, DocTabChange } from '../global-event/global-event.base';

type MixPanelStorybookEvents = Observable<readonly [MixpanelEvents, MixpanelEventData<MixpanelEvents>]>;

export function getMixpanelEvents(): MixPanelStorybookEvents[] {
  const change = addons.getChannel();
  const localStorage = getInstance(LocalStorage);
  const globalEvent = getInstance(GlobalEvent);

  // MixpanelEvents.Start
  const start$: MixPanelStorybookEvents = of([
    MixpanelEvents.Start,
    {
      theme: localStorage.getThemeOrDefault(),
    },
  ]);

  // MixpanelEvents.PageChange
  const pageChange$: MixPanelStorybookEvents = fromStorybookEvent<string>(change, events.DOCS_RENDERED).pipe(
    map((storyPageId) => {
      const category =
        (findKey(StorybookPageCategories, (value) =>
          storyPageId.startsWith(kebabCase(value))
        ) as StorybookPageCategories) ?? StorybookPageCategories.Unknown;

      const data = {
        pageName: storyPageId,
        category,
        theme: localStorage.getThemeOrDefault(),
      } satisfies MixpanelEventData<MixpanelEvents.PageChange>;

      return [MixpanelEvents.PageChange, data] as const;
    })
  );

  // MixpanelEvents.ThemeChange
  const themeChange$: MixPanelStorybookEvents = fromStorybookEvent<ThemeChangeEvent>(change, EVENTS.THEME_CHANGE).pipe(
    withCurrentPageId(),
    map(([theme, currentPageId]) => {
      const data = {
        pageName: currentPageId,
        theme: {
          id: theme.id,
          selectedModes: theme.selectedModes,
        },
      } satisfies MixpanelEventData<MixpanelEvents.ThemeChange>;

      return [MixpanelEvents.ThemeChange, data] as const;
    }),
    filter((event) => !!event)
  );

  // MixpanelEvents.TabChange
  const tabChange$: MixPanelStorybookEvents = fromStorybookEvent<DocTabChange>(change, EVENTS.DOC_TAB_CHANGE).pipe(
    withCurrentPageId(),
    map(([event, currentPageId]) => {
      const data = {
        pageName: currentPageId,
        tabName: event.tabName,
        theme: localStorage.getThemeOrDefault(),
      } satisfies MixpanelEventData<MixpanelEvents.TabChange>;

      return [MixpanelEvents.TabChange, data] as const;
    })
  );

  // MixpanelEvents.ExampleToggle
  const exampleToggle$: MixPanelStorybookEvents = fromStorybookEvent<DocExampleToggle>(
    change,
    EVENTS.DOC_EXAMPLE_TOGGLE
  ).pipe(
    withCurrentPageId(),
    map(([event, currentPageId]) => {
      const data = {
        pageName: currentPageId,
        storyName: event.storyName,
        isOpen: event.isOpen,
        theme: localStorage.getThemeOrDefault(),
      } satisfies MixpanelEventData<MixpanelEvents.ExampleToggle>;

      return [MixpanelEvents.ExampleToggle, data] as const;
    })
  );

  // MixpanelEvents.OverviewControlToggle
  const overviewControlToggle$: MixPanelStorybookEvents = globalEvent.openStoryControl$.pipe(
    switchMap(({ story }) =>
      globalEvent.closeStoryControl$.pipe(
        map(() => ({ isOpen: false, storyName: story.name })),
        take(1),
        startWith({ isOpen: true, storyName: story.name }),
        withCurrentPageId(),
        map(([event, currentPageId]) => {
          const data = {
            pageName: currentPageId,
            storyName: event.storyName,
            isOpen: event.isOpen,
            theme: localStorage.getThemeOrDefault(),
          } satisfies MixpanelEventData<MixpanelEvents.OverviewControlToggle>;

          return [MixpanelEvents.OverviewControlToggle, data] as const;
        })
      )
    )
  );

  // MixpanelEvents.OverviewSourceToggle
  const overviewSourceToggle$: MixPanelStorybookEvents = fromStorybookEvent<DocOverviewSourceToggle>(
    change,
    EVENTS.DOC_OVERVIEW_SOURCE_TOGGLE
  ).pipe(
    withCurrentPageId(),
    map(([event, currentPageId]) => {
      const data = {
        pageName: currentPageId,
        storyName: event.storyName,
        isOpen: event.isOpen,
        theme: localStorage.getThemeOrDefault(),
      } satisfies MixpanelEventData<MixpanelEvents.OverviewSourceToggle>;

      return [MixpanelEvents.OverviewSourceToggle, data] as const;
    })
  );

  return [start$, pageChange$, themeChange$, tabChange$, exampleToggle$, overviewControlToggle$, overviewSourceToggle$];
}

export function withCurrentPageId<T>(): OperatorFunction<T, readonly [T, string]> {
  return (source) =>
    source.pipe(
      map((value: T) => [value, getCurrentPageId()] as const),
      filter(([_, currentPageId]) => !!currentPageId)
    );
}

function getCurrentPageId(): string {
  const lastRenderedEvents: string[] = addons.getChannel().last(events.DOCS_RENDERED) ?? [];
  return lastRenderedEvents[0];
}
