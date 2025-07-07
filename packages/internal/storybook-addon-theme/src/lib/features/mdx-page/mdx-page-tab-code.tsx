import { Markdown } from '@storybook/addon-docs';
import { SupportedLanguage } from '@storybook/components';

import { Tab, Tabs } from '@cocokits/react-tabs';

interface MdxPageTabCodeProps {
  codeTabs: { [key: string]: string };
  language?: SupportedLanguage;
}

export const MdxPageTabCode = ({ codeTabs, language = 'typescript' }: MdxPageTabCodeProps) => {
  return (
    <Tabs>
      {Object.keys(codeTabs).map((tab) => (
        <Tab key={tab} header={tab} value={tab}>
          <Markdown>{`\`\`\`${language}\n${codeTabs[tab]}\n\`\`\``}</Markdown>
        </Tab>
      ))}
    </Tabs>
  );
};
