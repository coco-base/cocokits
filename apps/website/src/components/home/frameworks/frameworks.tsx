import Link from 'next/link';
import './frameworks.scss';
import { SvgIcon } from '@cocokits/react-icon';
import { Icons } from '@cocokits/common-icons';
import { Framework } from './framework';


export const Frameworks = () => {
  return (
    <div id="section_frameworks" className="frameworks__host">
      <h2>Supported frameworks</h2>

      <p className='frameworks__description'>
        Deploy and run no matter what tool you use.
        <br/>
        Learn what’s coming next from
        <Link className='ml-xs' href="#">
          CocoKits Roadmap
          <SvgIcon color="brand" icon={Icons.arrowRight}/>
        </Link>
      </p>


      <div className='frameworks__list'>
        <Framework framework='angular' active={true}/>
        <Framework framework='react'/>
        <Framework framework='vue'/>
        <Framework framework='html'/>
        <Framework framework='web-components'/>
      </div>

    </div>
  );
};
