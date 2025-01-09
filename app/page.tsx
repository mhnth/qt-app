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
import { useQT } from '@/qt/QTContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function TranslatePage() {
  const [inputTxt, setInputTxt] = useState('');
  const { translateQT } = useQT();
  const [outputFileName, setOutputFileName] = useState('');

  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedInputTxt = sessionStorage.getItem('inputTxt');
    const savedOutputFileName = sessionStorage.getItem('outputFileName');

    if (savedInputTxt) setInputTxt(savedInputTxt);
    if (savedOutputFileName) setOutputFileName(savedOutputFileName);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('inputTxt', inputTxt);
    sessionStorage.setItem('outputFileName', outputFileName);
  }, [inputTxt, outputFileName]);

  const handleDel = (option: 'in' | 'out') => {
    if (option === 'in') {
      setInputTxt(() => '');
      setOutputFileName('');
    } else {
      // setTranslatedTxt('');
    }
  };

  const handleCopy = (option: 'in' | 'out') => {
    const text =
      option === 'in' ? inputTxt : readerRef?.current?.innerText || '';

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Đã sao chép kết quả dịch vào khay nhớ tạm');
    } else {
      console.error('Browser not support clipboard API');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setInputTxt(content.replaceAll(/[\n\r]+/g, '\n'));
    };

    const fileName = file.name.replace('.txt', '');
    const title = translateQT(fileName, false) + '-' + `${fileName}` + '.txt';

    setOutputFileName(title || 'qt.output.file');

    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (readerRef.current) {
      const textContent = readerRef.current.innerText;

      if (!textContent) {
        return;
      }

      const blob = new Blob([textContent], { type: 'text/plain' });

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = outputFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-2 text-white min-h-screen">
      <div
        className="mt-6 md:min-h-max min-h-[100vh] w-full rounded-md flex flex-col bg-neutral-800
        border px-6 pb-6 bg-opacity-60 shadow-md border-neutral-600"
      >
        <div className="h-max">
          <div className="mb-6 mt-2 bg-opacity-65 flex gap-4 font-light">
            <Link className="flex gap-1 items-center" href={'/'}>
              <ILanguage className="fill-current w-4 h-4" />
              Dịch
            </Link>
            <Link
              href={'/dict'}
              className="flex items-center gap-1 text-neutral-300"
            >
              <IBook className="fill-current w-3 h-4" />
              Từ điển cá nhân
            </Link>
          </div>
          <div className="flex justify-between">
            <label htmlFor="">Văn bản tiếng Trung</label>

            <div className="flex items-center gap-8 px-4">
              <label
                title="upload txt tiếng Trung"
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
              <button title="xóa input" onClick={() => handleDel('in')}>
                <IDelete className="w-5 fill-neutral-300" />
              </button>
              <button title="copy input" onClick={() => handleCopy('in')}>
                <ICopy className="w-4 fill-neutral-300" />
              </button>
            </div>
          </div>

          <textarea
            className="mt-2 h-[50px] w-full rounded-sm border border-neutral-500
            p-2 outline-none bg-neutral-900 bg-opacity-50"
            value={inputTxt}
            onChange={(e) => {
              setInputTxt(e.target.value);
            }}
          />

          {/* <div>
            Settings
            <div></div>
          </div> */}
        </div>

        <div className="mt-3 rounded-md border px-4 border-neutral-600">
          <div className="md:h-max h-screen">
            <div className="flex justify-between items-center border-neutral-600 border-b">
              <label htmlFor="">
                Kết quả dịch
                <span className="ml-2 font-light underline">
                  {outputFileName}
                </span>
              </label>
              <div className="flex gap-8">
                <button
                  title="copy văn bản kết quả dịch"
                  onClick={() => handleCopy('out')}
                >
                  <ICopy className="w-4 fill-neutral-300" />
                </button>
                <button
                  title="tải về txt kết quả dịch"
                  onClick={handleDownload}
                >
                  <IDownload className="w-5 fill-neutral-300" />
                </button>
              </div>
            </div>
            <div className="md:h-[600px] mt-4 space-y-8 h-[calc(100vh-37)] overflow-y-scroll w-full text-justify">
              <Reader ref={readerRef} rawText={inputTxt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
