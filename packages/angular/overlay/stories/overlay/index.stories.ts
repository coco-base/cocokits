import { applicationConfig, moduleMetadata } from '@storybook/angular';

import { StoriesMeta, withThemeConfigProvider } from '@cocokits/storybook-addon-theme-angular';

// import { AnimationOverlayStoryComponent } from './components/animation-overlay-story.component';
// import { BasicOverlayStoryComponent } from './components/basic-overlay-story.component';
// import { ConnectToElementStoryComponent } from './components/connect-to-element-story.component';
// import { DefaultOverlayStoryComponent } from './components/default-overlay-story.component';
// import { SizeOverlayStoryComponent } from './components/size-overlay-story.component';
import descriptionMd from './description.md';
import { OverlayService } from '../../src';
import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export { Default } from './default/default.stories';
// export { NoBackdrop } from './no-backdrop.stories';
// export { DisableBackdropClose } from './disable-backdrop-close.stories';
// export { PanelClass } from './panel-class.stories';
// export { Size } from './size.stories';
// export { CustomViewContainerRef } from './custom-view-container-ref.stories';
// export { Animation } from './animation.stories';
// export { ConnectToElement } from './connect-to-element.stories';

const meta: StoriesMeta = {
  component: OverlayComponent,
  title: 'CDK/Overlay',
  subcomponents: [OverlayService],
  decorators: [
    applicationConfig({
      providers: [withThemeConfigProvider()],
    }),
    moduleMetadata({
      imports: [
        // DefaultOverlayStoryComponent,
        // BasicOverlayStoryComponent,
        // AnimationOverlayStoryComponent,
        // ConnectToElementStoryComponent,
        // SizeOverlayStoryComponent,
      ],
      providers: [withThemeConfigProvider()], // TODO: find out why we need to provide this again
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
    cckAddon: {
      componentName: 'overlay',
      subcomponentNames: {
        OverlayService: null,
      },
    },
  },
  argTypes: {
    closeAnimationDone$: { table: { category: 'outputs', type: { summary: 'Observable<TResult | undefined>' } } },
  },
};
export default meta;
