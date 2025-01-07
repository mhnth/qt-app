'use client';

import React, { useEffect, useState } from 'react';
import { cx } from '@/lib/utils';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { IBookmark, IClose, ILanguage, IRight, IToc } from '../icons';
import { ChapterModal } from './toc-modal';
import { SwitchThemeButton } from '../common';
import Link from 'next/link';
import { THEMES, TRANSLATE_OPTIONS } from '@/lib/constants';
import { useQT } from '@/lib/qt/QTContext';
import { useUISettings } from '../ui-settings-context';

interface ChapUtilProps {
  chapterCount: number;
}

interface SettingModalProps {
  isOpen: boolean;
  setOpenModal: (b: boolean) => any;
  translateMode: string;
  novelSlug: string;
  chapterNum: number;
  novelId: number;
}

const SettingModal: React.FC<SettingModalProps> = ({
  isOpen,
  setOpenModal,
  translateMode,
  novelSlug,
  chapterNum,
  novelId,
}) => {
  const { revalidate } = useQT();
  const { setTheme, setFontSize } = useUISettings();

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(event.target.value as any);
  };

  return (
    <>
      <div
        className={cx(
          `absolute bottom-full left-1/2 z-50 w-full max-w-4xl -translate-x-1/2 border border-sky-300 
          bg-neutral-100 p-2 text-gray-900`,
          !isOpen && 'hidden',
        )}
      >
        <div className="relative mx-auto h-max w-full max-w-4xl px-4">
          <div className="flex justify-between border-b border-gray-800 py-1">
            <span>Settings</span>
            <span
              onClick={() => setOpenModal(false)}
              className="cursor-pointer rounded-md border border-stone-100 px-2 text-xl"
            >
              <IClose className="w-3 [&>path]:fill-stone-900" />
            </span>
          </div>
          <div className="mx-0 border-b border-stone-900">
            <label htmlFor="">Chế độ dịch</label>
            <div className="flex flex-wrap gap-1 py-2 text-sm">
              {TRANSLATE_OPTIONS.map((t, i) => (
                <Link
                  className={cx(
                    `flex w-[70px] items-center justify-center rounded-md border-2 border-sky-200 py-1 
                    text-center text-gray-100`,
                    t.code === translateMode && 'border-sky-500',
                    t.code == 'baidu' && 'bg-rose-700',
                    t.code == 'tt' && 'bg-stone-900',
                    t.code == 'qt' && 'bg-cyan-900',
                  )}
                  key={i}
                  href={`/${novelSlug}.${novelId}/chuong-${chapterNum}?mt=${t.code}`}
                >
                  {t.label}
                </Link>
              ))}
              <span
                onClick={() => revalidate()}
                className="cursor-pointer rounded-md border-2 border-stone-50 bg-neutral-800 p-2 text-gray-100"
              >
                Reload QT
              </span>
            </div>
          </div>

          <div className="mx-0 border-b border-stone-900">
            <label htmlFor="">Theme</label>
            <div className="flex flex-wrap gap-1 py-2 text-sm">
              {THEMES.map((t, i) => (
                <button
                  onClick={() => {
                    setTheme(t as any);
                  }}
                  className={cx(
                    `flex w-[70px] items-center justify-center rounded-md border-2 border-sky-400 py-1 
                    text-center text-gray-900`,
                    t === 'White' && 'bg-[#fafafa]',
                    t === 'Grey' && 'bg-[#d6d3d1]',
                    t === 'Dark' && 'bg-[#1f1f1f] text-white',
                    t === 'Blue' && 'bg-[#E6F1FA]',
                    t === 'Yellow' && 'bg-[#FFF8EB]',
                  )}
                  key={i}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-14">
            <div>
              <label htmlFor="">Cỡ chữ</label>
              <div className="mt-2 flex flex-col gap-1 md:flex-row md:gap-4">
                <div className="space-x-2">
                  <input
                    type="radio"
                    id="small"
                    name="font_size"
                    value="small"
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="small">Nhỏ</label>
                </div>

                <div className="space-x-2">
                  <input
                    type="radio"
                    id="medium"
                    name="font_size"
                    value="base"
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="medium">Vừa</label>
                </div>

                <div className="space-x-2">
                  <input
                    type="radio"
                    id="large"
                    name="font_size"
                    value="large"
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="large">Lớn</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const ChapterUtils: React.FC<ChapUtilProps> = ({ chapterCount }) => {
  const [scrollingDown, setScrollingDown] = useState(false);
  const [openChaptersModal, setOpenChaptersModal] = useState<boolean>(false);
  const [openSettingModal, setOpenSettingModal] = useState<boolean>(false);

  const router = useRouter();
  const params = useParams();
  const translatedMode = useSearchParams().get('mt') || 'qt';

  const { novel, chapter } = params;
  const chapterNum = +(chapter as string).replace('chuong-', '');
  const [novelSlug, novelId] = (novel as string).split('.');

  const navigateToChapter = (offset: number) => {
    router.push(`/${novel}/chuong-${chapterNum + offset}?mt=${translatedMode}`);
  };

  useEffect(() => {
    let previousScrollTop = 0;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;

      setScrollingDown(
        scrollTop > previousScrollTop &&
          scrollTop < scrollHeight - clientHeight,
      );

      previousScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', openChaptersModal);
    return () => document.body.classList.remove('overflow-hidden');
  }, [openChaptersModal]);

  return (
    <>
      <ChapterModal
        currentChapter={+chapterNum}
        onOutsideClick={setOpenChaptersModal}
        hidden={!openChaptersModal}
        novelId={+novelId}
        novelSlug={novelSlug}
      />

      <div
        className={cx(
          'fixed bottom-0 z-50 w-full bg-opacity-95 md:px-0',
          scrollingDown && 'hidden',
        )}
      >
        <SettingModal
          isOpen={openSettingModal}
          setOpenModal={setOpenSettingModal}
          translateMode={translatedMode}
          novelSlug={novelSlug}
          chapterNum={chapterNum}
          novelId={+novelId}
        />

        <div className="mx-auto flex max-w-4xl items-center justify-between bg-black/80 px-6 py-2 md:px-8">
          <button
            onClick={() => {
              setOpenChaptersModal(true);
            }}
          >
            <IToc
              className={cx(
                openChaptersModal
                  ? '[&>path]:fill-rose-500'
                  : '[&>path]:fill-stone-50',
              )}
            />
          </button>
          <button onClick={() => setOpenSettingModal(!openSettingModal)}>
            <ILanguage
              className={cx(
                'h-6 w-6 stroke-2 hover:fill-rose-500',
                openSettingModal ? 'fill-rose-500' : 'fill-stone-50',
              )}
            />
          </button>

          <Link className="" href={''}>
            <IBookmark className="w-5 fill-stone-100 hover:[&>path]:fill-rose-500" />
          </Link>
          <div className="hidden w-5 md:block">
            <SwitchThemeButton classnames="[&>path]:fill-stone-50" />
          </div>

          <div className="flex space-x-8 text-white md:w-max">
            <button
              className="flex items-center gap-2 hover:text-rose-400"
              disabled={chapterNum === 1}
              onClick={() => navigateToChapter(-1)}
            >
              <IRight className="rotate-180 fill-current" />
              Prev
            </button>
            <button
              className={cx(
                'flex items-center gap-2 hover:text-sky-500',
                chapterNum === chapterCount && 'text-neutral-400',
              )}
              onClick={() => navigateToChapter(1)}
              disabled={chapterNum === chapterCount}
            >
              Next
              <IRight className="fill-current" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
