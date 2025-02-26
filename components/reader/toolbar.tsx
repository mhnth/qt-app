import { cx } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { IChapCount, IMenu, IToc } from '../icons';
import Link from 'next/link';
import { IHome } from '../icons/home';
import { useReader } from '@/hooks/ui-context';

interface ToolbarProps {}

export const Toolbar: React.FC<ToolbarProps> = ({}) => {
  const [scrollingDown, setScrollingDown] = useState(false);
  const [openChaptersModal, setOpenChaptersModal] = useState<boolean>(false);
  const [openSettingModal, setOpenSettingModal] = useState<boolean>(false);
  const { setSidebar } = useReader();

  useEffect(() => {
    let previousScrollTop = 0;

    const container = document.getElementById('virtuoso-container');

    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      setScrollingDown(
        scrollTop > previousScrollTop &&
          scrollTop < scrollHeight - clientHeight,
      );

      previousScrollTop = scrollTop;
    };

    container!.addEventListener('scroll', handleScroll);
    return () => container!.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className={cx('fixed bottom-0 w-full', scrollingDown && 'hidden')}>
        <div className="mx-auto flex w-full max-w-4xl justify-between bg-slate-950/45 px-4 py-2 backdrop-blur-lg">
          <button
            onClick={(e) => {
              e.preventDefault();
              setSidebar('toc');
            }}
          >
            <IToc className="fill-white" />
          </button>
          <Link href={'/'}>
            <IHome className="w-6 fill-white" />
          </Link>
        </div>
      </div>
    </>
  );
};
