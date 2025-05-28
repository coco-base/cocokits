import './for-users.scss';
import Image from 'next/image';

import { ListItem } from '../../list/list-item';

export const ForDesigners = () => {
  return (
    <div id="section__for-designer" className="for-users__host">
      <div className="for-users__section">
        <Image src="/for-designer.png" alt="CocoKits for Designers" width="1292" height="1009" />
      </div>

      <div className="for-users__section">
        <h2>CocoKits for Designers</h2>
        <p className="mb-xl">
          Tools, workflows, and infrastructure you need to build and deploy your web application with minimal coding
          knowledge.
        </p>

        <ListItem>Convert Figma variables to reusable design tokens</ListItem>
        <ListItem>Create UI components without learning any framework</ListItem>
        <ListItem tag="Soon" inactive={true}>
          Export design tokens to your favorite framework
        </ListItem>
      </div>
    </div>
  );
};
