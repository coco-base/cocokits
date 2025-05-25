import './frameworks.scss';
import Link from 'next/link';

import { Icons } from '@cocokits/common-icons';
import { SvgIcon } from '@cocokits/react-icon';

import { Framework } from './framework';

export const Frameworks = () => {
  return (
    <div id="section__frameworks" className="frameworks__host">
      <h2>Supported frameworks</h2>

      <p className="frameworks__description">
        Deploy and run no matter what tool you use.
        <br />
        Learn what’s coming next from
        <Link
          className="ml-xs"
          href="https://github.com/orgs/coco-base/projects/1/views/8"
          rel="noopener noreferrer"
          target="_blank">
          CocoKits Roadmap
          <SvgIcon color="brand" icon={Icons.arrowRight} />
        </Link>
      </p>

      <div className="frameworks__list">
        <Framework framework="angular" active={true} />
        <Framework framework="react" active={true} />
        <Framework framework="vue" />
        <Framework framework="html" />
        <Framework framework="web-components" />
      </div>
    </div>
  );
};
