'use client';

import { ICopy, IDelete, IUpload } from '@/components/icons';
import { Reader } from '@/components/reader/reader';
import { useReader } from '@/hooks/ui-context';
import { splitIntoChapters } from '@/lib/utils';
import { useQT } from '@/qt/QTContext';
import Link from 'next/link';
import {
  useEffect,
  useRef,
  useCallback,
  memo,
  useState,
  RefObject,
} from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

// Định nghĩa type cho context
interface ReaderContext {
  preferences: { currentChapter?: number };
  setChapterList: (chapters: string[]) => void;
}

interface QTContext {
  translateQT: (text: string, flag: boolean) => string;
}

// Định nghĩa type cho props của Header
interface HeaderProps {
  handleDownload: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDel: () => void;
  handleCopy: () => void;
}

const Header = memo(
  ({ handleDownload, handleUpload, handleCopy, handleDel }: HeaderProps) => (
    <div className="v-scroller border-b border-slate-500 py-4 pt-14">
      <div className="flex justify-end">
        <Link href="/">Home</Link>
      </div>
      <div className="flex flex-col items-center space-x-4 py-4 md:flex-row md:items-start md:space-x-6 md:pr-12">
        <div className="flex-shrink-0">
          <img
            className="h-40 w-28 rounded-md object-cover"
            src="https://news.khangz.com/wp-content/uploads/2024/12/Chill-guy-la-gi-750x450.jpg"
            alt=""
          />
        </div>
        <article className="mt-6 md:mt-0">
          <h1 className="text-white">Tên sách</h1>
          <p className="my-2 text-sm font-light text-slate-200">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit...
          </p>
          <div className="font-light text-sky-300">
            <ul className="flex gap-2">
              <li>#pure love</li>
              <li>#h</li>
              <li>#mother</li>
            </ul>
          </div>
          <div className="info my-4 space-x-2 text-sm text-slate-400">
            <span>Tựa gốc: </span>
            <span>Updated on February 17, 2025</span>
            <span>19,034 character(s)</span>
          </div>
          <div className="mx-auto my-8 mb-2 flex w-max items-center gap-8 px-4 md:mx-0">
            <label htmlFor="file-upload" className="cursor-pointer">
              <IUpload className="w-5 fill-neutral-300" />
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleUpload}
            />
            <button onClick={handleDel}>
              <IDelete className="w-5 fill-neutral-300" />
            </button>
            <button onClick={handleCopy}>
              <ICopy className="w-4 fill-neutral-300" />
            </button>
            <button
              className="rounded-md bg-sky-700 px-4 py-1 hover:bg-sky-300"
              onClick={handleDownload}
            >
              download
            </button>
          </div>
        </article>
      </div>
    </div>
  ),
);

Header.displayName = 'Header';

// Định nghĩa type cho props của VirtualList
interface VirtualListProps {
  data: string[];
  initialScrollIndex: number;
  handleDownload: () => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDel: () => void;
  scrollToIndexFn: (virtuosoRef: RefObject<VirtuosoHandle | null>) => void;
}

const VirtualList = memo(
  ({
    data,
    initialScrollIndex,
    handleDel,
    handleDownload,
    handleUpload,
    scrollToIndexFn,
  }: VirtualListProps) => {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    useEffect(() => {
      scrollToIndexFn(virtuosoRef);
    }, [scrollToIndexFn]);

    return (
      <Virtuoso
        ref={virtuosoRef}
        id="v-container"
        className="no-scrollbar"
        style={{ height: '100%' }}
        totalCount={data.length + 1}
        itemContent={(index: number) =>
          index === 0 ? (
            <Header
              handleDownload={handleDownload}
              handleUpload={handleUpload}
              handleCopy={() => {}}
              handleDel={() => {}}
            />
          ) : (
            <div className="v-scroller border-b border-slate-500 py-4">
              <Reader rawText={data[index]} />
            </div>
          )
        }
        increaseViewportBy={300}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.data === nextProps.data &&
    prevProps.initialScrollIndex === nextProps.initialScrollIndex,
);

VirtualList.displayName = 'VirtualList';

export default function ReadingPage() {
  const { translateQT } = useQT() as QTContext;
  const [inputTxt, setInputTxt] = useState<string>('');
  const [outputFileName, setOutputFileName] = useState<string>('');
  const [textParts, setTextParts] = useState<string[]>([]);
  const { preferences, setChapterList } = useReader() as ReaderContext;

  const handleDel = useCallback(() => {
    setInputTxt('');
    setOutputFileName('');
    setTextParts([]);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(textParts.join('\n'));
    alert('✔️ Đã sao chép kết quả vào khay nhớ tạm');
  }, [textParts]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        setInputTxt(content.replace(/\r?\n/g, '\n'));
      };
      const fileName = file.name.replace('.txt', '');
      setOutputFileName(`${translateQT(fileName, false)}-${fileName}.txt`);
      reader.readAsText(file);
    },
    [translateQT],
  );

  const handleDownload = useCallback(() => {
    const translatedText = translateQT(inputTxt, false);
    if (!translatedText) return alert('❌ tải xuống không thành công');

    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName || 'translated.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [inputTxt, outputFileName, translateQT]);

  useEffect(() => {
    sessionStorage.setItem('outputFileName', outputFileName);
    if (!inputTxt) {
      setTextParts([]);
      setChapterList([]);
      return;
    }

    const [textChunks, chapterTitles] = splitIntoChapters(inputTxt);
    const transTitles = translateQT(chapterTitles.join('000'), false);
    setTextParts(textChunks || []);
    setChapterList(transTitles?.split('000') || chapterTitles);
  }, [inputTxt, outputFileName]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const handleScrollToIndex = (ref: RefObject<VirtuosoHandle | null>) => {
    virtuosoRef.current = ref.current; // Lưu ref
  };

  // Debug preferences.currentChapter
  useEffect(() => {
    console.log('currentChapter changed:', preferences.currentChapter);
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: preferences.currentChapter || 0,
        align: 'start',
      });
    }
  }, [preferences.currentChapter]);

  return (
    <div className="mx-auto min-h-screen max-w-4xl text-slate-100">
      <section className="flex h-screen w-full flex-col bg-slate-900/70 px-6 shadow-md">
        <div className="relative mt-2 h-full px-4 md:px-12">
          <VirtualList
            scrollToIndexFn={handleScrollToIndex}
            data={textParts}
            initialScrollIndex={preferences.currentChapter || 0}
            handleDownload={handleDownload}
            handleUpload={handleUpload}
            handleDel={handleDel}
          />
        </div>
      </section>
    </div>
  );
}
