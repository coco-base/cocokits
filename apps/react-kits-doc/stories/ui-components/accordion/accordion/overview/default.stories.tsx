import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { reactThemeArgsToTemplate, StoryObj } from '@cocokits/storybook-addon-theme-react';

export const Default: StoryObj<typeof Accordion> = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      source: [
        {
          filename: 'Source Code',
          language: 'tsx',
          code: `
          import { Accordion, AccordionPanel, AccordionHeder} from '@cocokits/react-components';

          export const MyComponent = () => {
            return (
              <Accordion
                <% if (typeof type !== 'undefined') { %> type="<%= type %>" <% } %>
                <% if (typeof size !== 'undefined') { %> size="<%= size %>" <% } %>
                <% if (typeof color !== 'undefined') { %> color="<%= color %>" <% } %>
                <% if (typeof additional !== 'undefined') { %> additional="<%= additional %>" <% } %>
                multiMode="<%= multiMode %>"
                instantAnimation="<%= instantAnimation %>"
                animationDuration="<%= duration %>"
                iconPosition="<%= iconPosition %>"
                toggleTrigger="<%= toggleTrigger %>"
              >
                <AccordionPanel>
                  <AccordionHeder>Accordion Header 1</AccordionHeder>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </AccordionPanel>

                <AccordionPanel>
                  <AccordionHeder>Accordion Header 2</AccordionHeder>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </AccordionPanel>

                <AccordionPanel>
                  <AccordionHeder>Accordion Header 3</AccordionHeder>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </AccordionPanel>
              </Accordion>
            )
          }
          `,
        },
      ],
      renderConditions: [renderWithPageTab('Overview')],
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
  args: {},
  render: (args) => (
    <Accordion
      {...reactThemeArgsToTemplate(args)}
      multiMode={args.cckControl.multiMode}
      instantAnimation={args.cckControl.instantAnimation}
      animationDuration={args.cckControl.duration}
      iconPosition={args.cckControl.iconPosition}
      toggleTrigger={args.cckControl.toggleTrigger}>

      <AccordionPanel>
        <AccordionHeader>Accordion Header 1</AccordionHeader>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </AccordionPanel>

      <AccordionPanel>
        <AccordionHeader>Accordion Header 1</AccordionHeader>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </AccordionPanel>

      <AccordionPanel>
        <AccordionHeader>Accordion Header 1</AccordionHeader>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </AccordionPanel>
    </Accordion>
  ),
};
