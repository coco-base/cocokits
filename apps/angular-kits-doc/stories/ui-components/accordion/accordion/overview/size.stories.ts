import { AccordionComponent } from '@cocokits/angular-accordion';
import { CCK_CONTROL, renderWithPageTab, renderWithThemeProp } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

export const Size: StoryObj<AccordionComponent> = {
  name: 'Size',
  parameters: {
    docs: {
      description: {
        story:
          'The size is adjustable to suit different design needs and screen dimensions, improving both aesthetics and usability.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithThemeProp('size'), renderWithPageTab('Overview')],
      singleControls: ['type'],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
         <% themeComponentConfig.size.values.map(size => { %>
            <cck-accordion
             <% if (typeof type !== 'undefined') { %> type='<%= type %>'<% } %>
              size='<%= size %>'
            >
              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 1</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>

              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 2</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>

              <cck-accordion-panel>
                <cck-accordion-header>Accordion Header 3</cck-accordion-header>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </cck-accordion-panel>
              </cck-accordion>
         <% }) %>
          `,
        },
      ],
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      @for (size of cckControl.themeComponentConfig?.size?.values; let col = $index; track size) {
        <h5 style="width: 100%; margin: 0">{{ size }}</h5>
        <cck-accordion [type]="cckControl.type" [size]="size">
          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 1</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 2</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>

          <cck-accordion-panel>
            <cck-accordion-header>Accordion Header 3</cck-accordion-header>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </cck-accordion-panel>
        </cck-accordion>
      }
    `,
  }),
};
