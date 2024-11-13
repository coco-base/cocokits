import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular';

import { AngularStoriesMeta } from '@cocokits/internal-model';

import { AnimationOverlayStoryComponent } from './components/animation-overlay-story.component';
import { BasicOverlayStoryComponent } from './components/basic-overlay-story.component';
import { ConnectToElementStoryComponent } from './components/connect-to-element-story.component';
import { DefaultOverlayStoryComponent } from './components/default-overlay-story.component';
import { SizeOverlayStoryComponent } from './components/size-overlay-story.component';
import descriptionMd from './description.md';
import { OverlayService } from '../../src';
import { OverlayComponent } from '../../src/components/overlay/overlay.component';

export { Default } from './default.stories';
export { NoBackdrop } from './no-backdrop.stories';
export { DisableBackdropClose } from './disable-backdrop-close.stories';
export { PanelClass } from './panel-class.stories';
export { Size } from './size.stories';
export { CustomViewContainerRef } from './custom-view-container-ref.stories';
export { Animation } from './animation.stories';
export { ConnectToElement } from './connect-to-element.stories';

const meta: AngularStoriesMeta = {
  component: OverlayComponent,
  title: 'CDK/Overlay',
  subcomponents: [OverlayService],
  tags: ['autodocs'],
  decorators: [
    componentWrapperDecorator((story) => `<div class="story-overlay-example">${story}</div>`),
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        DefaultOverlayStoryComponent,
        BasicOverlayStoryComponent,
        AnimationOverlayStoryComponent,
        ConnectToElementStoryComponent,
        SizeOverlayStoryComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd].join('\n'),
      },
    },
  },
  argTypes: {
    closeAnimationDone$: { table: { category: 'outputs', type: { summary: 'Observable<TResult | undefined>' } } },
  },
  args: {},
};
export default meta;
