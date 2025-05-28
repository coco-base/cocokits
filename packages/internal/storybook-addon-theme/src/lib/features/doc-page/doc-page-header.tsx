import { FC } from 'react';
import styled from 'styled-components';

import { hasNotValue, toArray } from '@cocokits/common-utils';

interface DocPageHeaderProps {
  title?: string;
  breadcrumb?: string | string[];
}

export const DocPageHeader: FC<DocPageHeaderProps & React.HTMLAttributes<HTMLDivElement>> = ({
  title,
  breadcrumb,
  ...props
}) => {
  const breadcrumbText = toArray(breadcrumb).join(' / ');

  if (hasNotValue(title) && hasNotValue(breadcrumbText)) {
    return null;
  }

  return (
    <StyledHost {...props}>
      {breadcrumbText && <StyledBreadcrumb>{breadcrumbText}</StyledBreadcrumb>}
      {title && <h1>{title}</h1>}
    </StyledHost>
  );
};

// region ---------------- STYLES ----------------
const StyledHost = styled.div`
  display: flex;
  flex-direction: column;
`;
const StyledBreadcrumb = styled.p.attrs({ role: 'navigation' })`
  font: var(--cck-doc-text-xs-medium);
  color: var(--cck-doc-color-brand-default);
  margin-bottom: 8px;
`;
// endregion
