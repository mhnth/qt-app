'use client';

import { ICopy, IDelete, IUpload } from '@/components/icons';
import { Reader } from '@/components/reader/reader';
import { useReader } from '@/hooks/ui-context';
import { splitIntoChapters } from '@/lib/utils';
import { useQT } from '@/qt/QTContext';
import Link from 'next/link';
import { useEffect, useRef, useState, memo } from 'react';

import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

const VirtuosoMemoized = memo(Virtuoso);

export default function ReadingPage() {
  const { translateQT } = useQT();
  const [inputTxt, setInputTxt] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [textParts, setTextParts] = useState<string[]>([]);
  const { preferences, setChapterList } = useReader();
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useEffect(() => {
    console.log('runn ne');

    // virtuosoRef.current?.scrollToIndex({
    //   index: preferences.currentChapter || 0,
    //   align: 'start',
    // });

    setTimeout(() => {
      virtuosoRef.current?.scrollToIndex({
        index: preferences.currentChapter || 0,
        align: 'start',
      });
    }, 100);
  }, [preferences.currentChapter]);

  // useEffect(() => {
  //   if (savedInputTxt) setInputTxt(savedInputTxt);
  //   if (savedOutputFileName) setOutputFileName(savedOutputFileName);
  // }, [preferences.currentChapter]);

  useEffect(() => {
    // sessionStorage.setItem('inputTxt', inputTxt);
    sessionStorage.setItem('outputFileName', outputFileName);

    const [textChunks, chapterTitles] = splitIntoChapters(inputTxt);
    //translate chapter titles
    const transTitles = translateQT(chapterTitles.join('000'), false);
    setTextParts(inputTxt ? textChunks || [] : []);
    setChapterList(transTitles?.split('000') || chapterTitles);
  }, [inputTxt, outputFileName]);

  const handleDel = () => {
    setInputTxt('');
    setOutputFileName('');
    setTextParts([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textParts.join('\n'));
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

  return (
    <div className="mx-auto min-h-screen max-w-4xl text-slate-100">
      <section className="flex h-screen w-full flex-col bg-slate-900/70 px-6 shadow-md">
        <div className="mt-2 h-full px-4 md:px-12">
          <VirtuosoMemoized
            ref={virtuosoRef}
            id="v-container"
            className="no-scrollbar"
            style={{ height: '100%' }}
            totalCount={textParts.length + 1}
            itemContent={(index) => (
              <div className="v-scroller border-b border-slate-500 py-4 pt-14">
                {index === 0 ? (
                  <>
                    <div className="flex justify-end">
                      <Link href={'/'}>Home</Link>
                    </div>
                    <div
                      className="flex flex-col items-center space-x-4 py-4 
                                 md:flex-row md:items-start md:space-x-6 md:pr-12"
                    >
                      <div className="flex-shrink-0">
                        <img
                          className="h-40 w-28 rounded-md object-cover"
                          src="https://news.khangz.com/wp-content/uploads/2024/12/Chill-guy-la-gi-750x450.jpg"
                          alt=""
                        />
                      </div>
                      <article className="mt-6 md:mt-0">
                        <h1 className="text-white">
                          {(outputFileName && outputFileName?.split('-')[0]) ||
                            'Tên sách'}
                        </h1>
                        <p className="my-2 text-sm font-light text-slate-200">
                          Lorem ipsum dolor sit, amet consectetur adipisicing
                          elit. Placeat ad itaque iusto aliquam magni sunt porro
                          cupiditate deleniti. Ad eligendi molestiae !
                        </p>
                        <div className="font-light text-sky-300">
                          <ul className="flex gap-2">
                            <li>#pure love</li>
                            <li>#h</li>
                            <li>#mother</li>
                          </ul>
                        </div>
                        <div className="info my-4 space-x-2 text-sm text-slate-400">
                          <span>
                            Tựa gốc:{' '}
                            {(outputFileName &&
                              outputFileName
                                ?.split('-')[1]
                                .replace('.txt', '')) ||
                              ''}
                          </span>
                          <span>Updated on February 17, 2025</span>
                          <span>19,034 character(s)</span>
                        </div>
                        <div className="mx-auto my-8 mb-2 flex w-max items-center gap-8 px-4 md:mx-0">
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
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
                  </>
                ) : (
                  <Reader rawText={textParts[index - 1]} />
                )}
              </div>
            )}
            // itemContent={(index) => (
            //   <div
            //     className="virtuoso-scroller py-4 border-b border-neutral-400" // Đảm bảo phần tử container có class này
            //   >
            //     <Reader rawText={textParts[index]} />
            //   </div>
            // )}
            increaseViewportBy={300}
          />
        </div>
      </section>
    </div>
  );
}
