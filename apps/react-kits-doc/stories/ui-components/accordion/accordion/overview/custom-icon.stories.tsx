import { Icons } from '@cocokits/common-icons';
import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { SvgIcon } from '@cocokits/react-icon';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

export const CustomIcon: StoryObj<typeof Accordion> = {
  name: 'Custom Icon',
  parameters: {
    docs: {
      description: {
        story:
          'The `customIcon` template allows you to replace the default icons with custom SVG icons, enhancing the visual appeal and branding of the accordion component.',
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
                <Accordion
                  <% if (typeof type !== 'undefined') { %> type='<%= type %>' <% } %>
                  iconTemplate={({ isExpanded }) => (
                    <SvgIcon icon={isExpanded ? Icons.minus : Icons.plus} />
                  )}>
                  <AccordionPanel>
                    <AccordionHeader
                      iconTemplate={({ isExpanded }) => (
                        <SvgIcon icon={isExpanded ? Icons.arrowUp : Icons.arrowDown} />
                      )}>
                      Accordion Header 1
                    </AccordionHeader>
                    
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                      magna aliqua.
                    
                  </AccordionPanel>

                  <AccordionPanel>
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
              );
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
    <Accordion
      type={args.cckControl.type}
      iconTemplate={({ isExpanded }) => <SvgIcon icon={isExpanded ? Icons.minus : Icons.plus} />}>
      <AccordionPanel>
        <AccordionHeader
          iconTemplate={({ isExpanded }) => <SvgIcon icon={isExpanded ? Icons.arrowUp : Icons.arrowDown} />}>
          Accordion Header 1
        </AccordionHeader>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </AccordionPanel>

      <AccordionPanel>
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
