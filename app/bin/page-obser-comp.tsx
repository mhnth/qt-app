'use client';

import {
  IBook,
  ICopy,
  IDelete,
  IDownload,
  ILanguage,
  IUpload,
} from '@/components/icons';
import { Reader } from '@/components/reader/reader';
import { splitIntoChunks } from '@/lib/utils';
import { useQT } from '@/qt/QTContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function TranslatePage() {
  const initialPart = 3;
  const { translateQT } = useQT();

  const [inputTxt, setInputTxt] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [visibleText, setVisibleText] = useState('');

  const readerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const textParts = splitIntoChunks(inputTxt, 10000);

  const [currentTextPart, setCurrentTextPart] = useState(initialPart);
  const [prevTextHeight, setPrevTextHeight] = useState(0);
  const [scrollPoint, setScrollPoint] = useState(0);

  useEffect(() => {
    const savedInputTxt = sessionStorage.getItem('inputTxt');
    const savedOutputFileName = sessionStorage.getItem('outputFileName');

    if (savedInputTxt) setInputTxt(savedInputTxt);
    if (savedOutputFileName) setOutputFileName(savedOutputFileName);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('inputTxt', inputTxt);
    sessionStorage.setItem('outputFileName', outputFileName);

    //reset current part
    setCurrentTextPart(0);
  }, [inputTxt, outputFileName]);

  useEffect(() => {
    setVisibleText(textParts[currentTextPart] || '');
  }, [inputTxt]);

  const handleDel = () => {
    setInputTxt('');
    setOutputFileName('');
    setVisibleText('');
    setCurrentTextPart(0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(visibleText);
    alert('✔️ Đã sao chép kết quả vào khay nhớ tạm');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleDownload = () => {
    const translatedText = translateQT(inputTxt, false);
    if (!translatedText) return alert('❌ tải xuống không thành công');
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadMoreText = () => {
    console.log('run load');

    const nextPart = currentTextPart + 1;

    if (nextPart >= textParts.length) return;

    const newText =
      currentTextPart !== initialPart
        ? textParts[nextPart - 1] + textParts[nextPart]
        : textParts[currentTextPart];

    setVisibleText(newText);
    setCurrentTextPart(nextPart);
  };

  console.log('curr', currentTextPart);

  useEffect(() => {
    if (!sentinelRef.current || !readerRef.current || !inputTxt) return;

    const currentScrollHeight = readerRef.current.scrollHeight;
    const newPrevTextHeight = currentScrollHeight - prevTextHeight;

    console.log('scroll, text height', currentScrollHeight, newPrevTextHeight);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          //calc reading point when delete prev text part
          const newReadingPoint =
            readerRef.current?.scrollTop! - prevTextHeight;
          setScrollPoint(newReadingPoint);

          loadMoreText();
        }
      },
      {
        root: readerRef.current, // Gán root là container cuộn
        // rootMargin: `${currentScrollHeight / 10}px`,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [currentTextPart, inputTxt]);

  useEffect(() => {
    if (!readerRef.current) return;

    setPrevTextHeight(readerRef.current.scrollHeight);
  }, [inputTxt]);

  useEffect(() => {
    if (!readerRef.current) return;

    setPrevTextHeight((prev) => readerRef!.current!.scrollHeight - prev);
  }, [currentTextPart]);

  useEffect(() => {
    if (readerRef.current) {
      readerRef.current.scrollTop = scrollPoint + 100;
    }
  }, [scrollPoint]);

  return (
    <div className="mx-auto max-w-5xl p-2 text-white min-h-screen">
      <div
        className="mt-6 md:min-h-max min-h-[100vh] w-full rounded-md flex flex-col bg-neutral-800 
                   border px-6 pb-6 bg-opacity-60 shadow-md border-neutral-600"
      >
        <div className="h-max">
          <div className="mb-6 mt-2 flex gap-4 font-light">
            <Link className="flex gap-1 items-center" href={'/'}>
              <ILanguage className="w-4 h-4 fill-white" />
              Dịch
            </Link>
            <Link
              href={'/dict'}
              className="flex items-center gap-1 text-neutral-300"
            >
              <IBook className="w-3 h-4" />
              Từ điển cá nhân
            </Link>
          </div>
          <div className="flex justify-between">
            <label>Văn bản tiếng Trung</label>
            <div className="flex items-center gap-8 px-4">
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
            </div>
          </div>

          <textarea
            className="mt-2 h-[50px] w-full rounded-sm border border-neutral-500 p-2 bg-neutral-900 bg-opacity-50"
            value={inputTxt}
            onChange={(e) => setInputTxt(e.target.value)}
          />
        </div>

        <div className="mt-3 rounded-md border px-4 border-neutral-600">
          <div className="md:h-max h-screen">
            <div className="flex justify-between items-center border-b border-neutral-600">
              <label>
                Kết quả dịch
                <span className="ml-2 font-light underline">
                  {outputFileName}
                </span>
              </label>
              <div className="flex gap-8">
                <button onClick={handleCopy}>
                  <ICopy className="w-4 fill-neutral-300" />
                </button>
                <button onClick={handleDownload}>
                  <IDownload className="w-5 fill-neutral-300" />
                </button>
              </div>
            </div>
            <div
              ref={readerRef}
              className="md:h-[600px] mt-4 h-[calc(100vh-37px)] overflow-y-scroll text-justify"
            >
              <Reader rawText={visibleText} />

              <div ref={sentinelRef} className="h-28 bg-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
