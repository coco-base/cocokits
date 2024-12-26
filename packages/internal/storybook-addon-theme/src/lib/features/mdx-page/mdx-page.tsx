import { ReactNode } from "react";

import { DocPage } from "../doc-page/doc-page";
import { DocTocItem } from "../doc-page/doc-page-toc";

export interface MdxPageProps {
  breadcrumb?: string;
  title?: string;
  hideThemeSwitcher?: boolean;
  tocItems?: DocTocItem[],
  children: ReactNode | ReactNode[];
}

export function MdxPage({breadcrumb, title, tocItems, hideThemeSwitcher, children}: MdxPageProps) {

  return (
    <DocPage breadcrumb={breadcrumb} title={title} tocItems={tocItems} hideThemeSwitcher={hideThemeSwitcher}>
      {children}
    </DocPage>
  )

}