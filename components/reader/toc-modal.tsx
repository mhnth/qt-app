'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { cx } from '@/lib/utils';
import { IRight } from '../icons';
import { getNovelToc } from '@/lib/services/novel';
import { IHome } from '../icons/home';

interface NovelToc {
  author: string;
  title: string;
  chapters: {
    novelId: number;
    title: string;
  }[];
}

interface ChapterModalProps {
  novelId: number;
  novelSlug: string;
  currentChapter: number;
  onOutsideClick: React.Dispatch<React.SetStateAction<boolean>>;
  hidden: boolean;
}

export const ChapterModal: React.FC<ChapterModalProps> = ({
  novelId,
  onOutsideClick,
  currentChapter,
  hidden,
  novelSlug,
}) => {
  const [novelToc, setNovelToc] = useState<NovelToc>();
  const fetchNovelToc = useCallback(async () => {
    const res = await getNovelToc(novelId);

    setNovelToc(res.data);
  }, [novelId]);

  useEffect(() => {
    fetchNovelToc();
  }, []);

  useEffect(() => {
    const element = document.getElementById('' + currentChapter);

    if (element) {
      element.scrollIntoView({
        behavior: 'instant',
        block: 'start',
      });
    }
  }, [novelToc, currentChapter, hidden]);

  return (
    <div
      className={cx(
        'fixed inset-0 z-50 bg-black/30 backdrop:blur-3xl',
        hidden && 'hidden',
      )}
      onClick={() => {
        onOutsideClick(() => false);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="chapter-bar absolute right-0 h-screen w-3/4 max-w-sm
                 overflow-y-scroll bg-white dark:bg-neutral-800"
      >
        <div className="sticky top-0 z-50 items-start bg-black/80">
          <div className="flex flex-col px-6">
            <div className="flex items-center gap-4 border-b border-gray-400 p-1 py-2">
              <Link href={'/'}>
                <IHome className="w-5" />
              </Link>
            </div>
            <div className="w-full rounded-xl p-1 py-3">
              <Link
                href={`/${novelSlug}.${novelId}`}
                className="flex items-center gap-3 
                font-light capitalize text-white hover:text-rose-500 dark:hover:text-rose-500"
              >
                <IRight className="rotate-180 fill-current" />
                {novelToc?.title}
              </Link>
            </div>
          </div>
        </div>
        <ul className="mb-20 px-4">
          {novelToc &&
            novelToc?.chapters.map((c, i) => {
              return (
                <li key={i} id={`${i + 5}`}>
                  <Link
                    href={`/${novelSlug}.${novelId}/chuong-${i + 1}`}
                    className={cx(
                      `mx-2 flex gap-2 overflow-hidden overflow-ellipsis whitespace-nowrap border-b-[0.5px]
                     border-neutral-200 py-2 text-sm dark:border-neutral-700 dark:text-neutral-300`,
                      i + 1 === currentChapter &&
                        'text-rose-500 dark:text-rose-500',
                    )}
                  >
                    <p className="text-[9px] opacity-50">#{i + 1}</p>
                    {c.title}
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
};
