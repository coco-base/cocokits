import './for-users.scss';
import Image from 'next/image';

import { ListItem } from '../../list/list-item';


export const ForDevelopers = () => {
  return (
    <div id="section__for-developer" className="for-users__host">

      <div className='for-users__section'>
        <h2>CocoKits for Developers</h2>
        <p className='mb-xl'>Tools and infrastructure to build, scale, and secure your website and application</p>

        <ListItem>Build and scale your design system</ListItem>
        <ListItem>Easy manage and update your project tokens</ListItem>
        <ListItem >Create multiple themes and streamline development</ListItem>
      </div>

      <div className='for-users__section'>
        <Image src='/for-developer.png' alt='CocoKits for Designers' width='1292' height='1009'/>
      </div>
    </div>
    
  );
};
