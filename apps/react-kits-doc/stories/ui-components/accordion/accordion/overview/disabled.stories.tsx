import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Disabled: StoryObj<typeof Accordion> = {
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
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Accordion, AccordionPanel, AccordionHeader } from "@cocokits/react-components";

          export const MyComponent = () => {
            return (
              <Accordion <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>>
                <AccordionPanel>
                  <AccordionHeader>Accordion Header 1</AccordionHeader>
                  
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua.
                  
                </AccordionPanel>

                <AccordionPanel disabled>
                  <AccordionHeader>Accordion Header 2</AccordionHeader>
                  
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua.
                  
                </AccordionPanel>

                <AccordionPanel>
                  <AccordionHeader>Accordion Header 3</AccordionHeader>
                  
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                    magna aliqua.
                  
                </AccordionPanel>
              </Accordion>
            )
          }
          `,
        },
      ],
      singleControls: ['type'],
      hasControl: false,
      controls: [CCK_CONTROL.type()],
    },
  },
  render: (args) => (
    <Accordion type={args.cckControl.type}>
      <AccordionPanel>
        <AccordionHeader>Accordion Header 1</AccordionHeader>
        
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        
      </AccordionPanel>

      <AccordionPanel disabled>
        <AccordionHeader>Accordion Header 2</AccordionHeader>
        
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        
      </AccordionPanel>

      <AccordionPanel>
        <AccordionHeader>Accordion Header 3</AccordionHeader>
        
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        
      </AccordionPanel>
    </Accordion>
  ),
};
