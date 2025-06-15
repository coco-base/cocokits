import { AccordionComponent } from '@cocokits/angular-accordion';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { ngThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Default: StoryObj<AccordionComponent> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
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
            <% if (typeof size !== 'undefined') { %> size='<%= size %>' <% } %>
            <% if (typeof color !== 'undefined') { %> color='<%= color %>' <% } %>
            multiMode="<%= multiMode %>"
            instantAnimation="<%= instantAnimation %>"
            animationDuration="<%= duration %>"
            iconPosition="<%= iconPosition %>"
            toggleTrigger="<%= toggleTrigger %>"
          >
            <cck-accordion-panel>
              <cck-accordion-header>Accordion Header 1</cck-accordion-header>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </cck-accordion-panel>

            <cck-accordion-panel>
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
      hasControl: true,
      controls: [
        CCK_CONTROL.type(),
        CCK_CONTROL.size(),
        CCK_CONTROL.color(),
        CCK_CONTROL.additional(),
        CCK_CONTROL.customSelect('Icon Position', ['right', 'left']),
        CCK_CONTROL.customSelect('Toggle Trigger', ['header', 'icon']),
        CCK_CONTROL.customNumber('Duration', 300),
        CCK_CONTROL.customBoolean('Multi Mode'),
        CCK_CONTROL.customBoolean('Instant Animation'),
      ],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `
        <cck-accordion
          ${ngThemeArgsToTemplate(args)}
          [multiMode]="cckControl.multiMode"
          [instantAnimation]="cckControl.instantAnimation"
          [animationDuration]="cckControl.duration"
          [iconPosition]="cckControl.iconPosition"
          [toggleTrigger]="cckControl.toggleTrigger"
        >
          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 1</cck-accordion-header>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </cck-accordion-panel>

          <cck-accordion-panel>
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
