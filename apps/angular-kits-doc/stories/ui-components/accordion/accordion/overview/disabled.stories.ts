import { AccordionComponent } from '@cocokits/angular-accordion';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Disabled: StoryObj<AccordionComponent> = {
  name: 'Disabled',
  parameters: {
    docs: {
      description: {
        story:
          'The `disabled` state allows the accordion to be visually and functionally inactive, preventing user interaction. This is useful for scenarios where the accordion should not be accessible, such as during loading states or when certain conditions are not met.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
          <cck-accordion
            <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
          >

            <cck-accordion-panel>
              <cck-accordion-header>Accordion Header 1</cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>

            <cck-accordion-panel disabled>
              <cck-accordion-header>Accordion Header 2</cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>

            <cck-accordion-panel>
              <cck-accordion-header>Accordion Header 3</cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>
          </cck-accordion>
          `,
        },
      ],
      singleControls: ['type'],
      hasControl: false,
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-accordion [type]="cckControl.type">

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 1</cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>

          <cck-accordion-panel disabled>
            <cck-accordion-header>Accordion Header 2</cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 3</cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>
        </cck-accordion>
      `,
    };
  },
};
