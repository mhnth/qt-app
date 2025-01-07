'use client';

import Link from 'next/link';
import React, { useEffect } from 'react';
import { cx } from '@/lib/utils';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { IRight, IUp } from '../icons';
import { Reader } from './reader';

interface ChapPageProps {
  novelTitle: string;
  chapterNum: number;
  rawText: string;
  novelSlug: string;
  chapterCount: number;
}

export const ChapPage: React.FC<ChapPageProps> = ({
  novelTitle,
  rawText,
  novelSlug,
  chapterCount,
}) => {
  const router = useRouter();
  const trans_mode = useSearchParams().get('mt') || 'qt';
  const params = useParams();
  const { chapter } = params;

  const chapterNum = parseInt((chapter as string).replace('chuong-', ''), 10);

  const navigateToChapter = (offset: number) => {
    router.push(`/${novelSlug}/chuong-${chapterNum + offset}?mt=${trans_mode}`);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (1) {
        if (e.key === 'ArrowLeft' && chapterNum > 1) {
          navigateToChapter(-1);
        } else if (e.key === 'ArrowRight') {
          navigateToChapter(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [chapterNum]);

  return (
    <>
      <article className="mx-auto h-max max-w-4xl px-2 pb-28 pt-8 md:px-6">
        <h1
          className="mx-auto block max-w-4xl pb-8 text-center text-xl capitalize 
          hover:text-amber-700 dark:hover:text-amber-600 md:px-20"
        >
          <Link href={`/${novelSlug}`}>{novelTitle}</Link>
        </h1>

        <Reader rawText={rawText} />

        {/* chapter btns */}
        <div className="mx-auto mt-6 flex w-max flex-col gap-2">
          <button
            className={cx(
              `flex w-48 items-center justify-center gap-2 rounded-md border 
              border-neutral-400 py-3 dark:border-neutral-700`,
              chapterNum == 1 && 'hidden',
            )}
            onClick={() => navigateToChapter(-1)}
          >
            <IUp className="w-3 -rotate-90 fill-current" />
            Chương trước
          </button>
          {chapterNum !== chapterCount && (
            <button
              className={cx(
                `py-3'border-neutral-400 flex w-48 items-center justify-center gap-2 
                 rounded-md border py-3 dark:border-neutral-700`,
              )}
              onClick={() => navigateToChapter(1)}
              disabled={chapterNum === chapterCount}
            >
              Chương tiếp
              <IRight className="w-3 fill-current" />
            </button>
          )}
        </div>
      </article>
    </>
  );
};
