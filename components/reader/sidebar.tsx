import { useReader } from '@/hooks/ui-context';
import React from 'react';

interface SidebarProps {}

export const ReaderSidebar: React.FC<SidebarProps> = ({}) => {
  const { preferences, setCurrentChapter, setSidebar } = useReader();

  const { sidebar, chapterList } = preferences;

  if (sidebar === 'toc') {
    return (
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop:blur-3xl"
        onClick={() => {
          setSidebar(null);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="no-scrollbar absolute right-0 h-screen w-3/4 max-w-sm overflow-y-scroll bg-slate-800 px-4"
        >
          {chapterList?.map((c, i) => {
            return (
              <div
                onClick={() => {
                  setCurrentChapter(i + 1);
                  setSidebar(null);
                }}
                className="cursor-pointer border-b-[1px] border-slate-700 px-6 py-3"
                key={i}
              >
                <span className="mr-2 text-xs font-light text-slate-400">
                  #{i + 1}
                </span>
                <span className="hover:underline">{c}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <></>;
};
