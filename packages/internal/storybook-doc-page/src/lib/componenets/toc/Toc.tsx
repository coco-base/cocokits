import React, { useEffect, useMemo, useRef, useState } from 'react';

import { intersectionObserver$ } from '@coco-kits/common-utils';

import { useStyles } from './Toc.style';
import { storybookNavigateTo } from '../../utils/doc-page.utils';

interface TocProps {
  stories: Story[];
}

interface Story {
  id: string;
  name: string;
}

interface TocStory extends Story {
  URIName: string
}

export const Toc = ({ stories }: TocProps) => {
  const tocClasses = useStyles();
  const [selected, setSelected] = useState('');
  const isNavigating = useRef<boolean>(false);

  const tocStories = useMemo<TocStory[]>(() =>
    stories.map(story => ({ ...story, URIName: encodeURIComponent(story.name.toLowerCase()) })
    ), [stories]);

  useEffect(() => {
    const selectors = stories.flatMap(story =>
      document.getElementById(encodeURIComponent(story.name.toLowerCase())) ?? [],
    );

    const subscriber = intersectionObserver$(selectors, { threshold: [0.5] })
      .subscribe(event => {
        if (isNavigating.current) {
          isNavigating.current = false;
          return;
        }
        for (const { intersectionRatio, target } of event.entries) {
          if (intersectionRatio >= 0.5) {
            setSelected(target.id);
            return;
          }
        }
      });

    return () => subscriber.unsubscribe();
  }, [stories]);

  const onTocItemCLick = (tocStory: TocStory) => {
    isNavigating.current = true;
    storybookNavigateTo(`#${tocStory.URIName}`);
    setSelected(tocStory.URIName);
  };

  return (
    <nav className={tocClasses.root}>
      <h3 className={tocClasses.heading}>On this page</h3>
      <ol className={tocClasses.ol}>
        {tocStories.map(tocStory => (
          <li className={tocStory.URIName === selected ? tocClasses.selected : ''} key={tocStory.id}>
            <a
              href={`#${tocStory.URIName}`}
              target="_self"
              onClick={() => onTocItemCLick(tocStory)}>
              {tocStory.name}
            </a>
          </li>
        )
        )}
      </ol>
    </nav>
  );
};
