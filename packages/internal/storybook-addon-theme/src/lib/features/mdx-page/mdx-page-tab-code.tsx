import { Markdown } from '@storybook/addon-docs';
import { SupportedLanguage } from '@storybook/components';

import { TabOld, TabsOld } from '@cocokits/react-tabs-old';

interface MdxPageTabCodeProps {
  codeTabs: { [key: string]: string };
  language?: SupportedLanguage;
}

export const MdxPageTabCode = ({ codeTabs, language = 'typescript' }: MdxPageTabCodeProps) => {
  return (
    <TabsOld>
      {Object.keys(codeTabs).map((tab) => (
        <TabOld key={tab} label={tab} value={tab}>
          <Markdown>{`\`\`\`${language}\n${codeTabs[tab]}\n\`\`\``}</Markdown>
        </TabOld>
      ))}
    </TabsOld>
  );
};
