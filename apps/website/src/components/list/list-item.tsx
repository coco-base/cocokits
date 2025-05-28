import { Icons } from '@cocokits/common-icons';
import { SvgIcon } from '@cocokits/react-icon';
import { ReactNode } from 'react';
import './list-item.scss';

interface ListItem {
  children: ReactNode | ReactNode[];
  prefixIcon?: (typeof Icons)[keyof typeof Icons];
  inactive?: boolean;
  tag?: string;
}

export function ListItem({ children, tag, inactive = false, prefixIcon = Icons.arrowHeadRight }: ListItem) {
  const className = inactive ? 'list-item__host list-item__host--inactive' : 'list-item__host';

  return (
    <div className={className}>
      {prefixIcon && <SvgIcon className="mr-xs" icon={prefixIcon} color={inactive ? 'gray' : 'brand'} />}
      {children}
      {tag && <span className="list-item__tag">{tag}</span>}
    </div>
  );
}
