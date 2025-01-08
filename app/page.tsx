'use client';

import { ICopy, IDelete, IDownload, IUpload } from '@/components/icons';
import { Reader } from '@/components/reader/reader';
import { useQT } from '@/qt/QTContext';
import { useRef, useState } from 'react';

export default function TranslatePage() {
  const [inputTxt, setInputTxt] = useState('');
  const { translateQT } = useQT();
  // const [translatedTxt, setTranslatedTxt] = useState('');
  const [hanviet, setHanviet] = useState<boolean>(false);
  const [outputFileName, setOutputFileName] = useState('QT.output.file');

  const readerRef = useRef<HTMLDivElement>(null);

  // const { loading, revalidate, translateQT } = useQT();

  const handleDel = (option: 'in' | 'out') => {
    if (option === 'in') {
      setInputTxt(() => '');
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
      setInputTxt(content.replaceAll(/[\n\r]+/g, '\n\n'));
    };

    const fileName = file.name.replace('.txt', '');
    const title = `${fileName}` + '-' + translateQT(fileName, false) + '.txt';

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
    <div className="mx-auto max-w-5xl p-2">
      <div
        className="mt-2 h-[95%] w-full rounded-md flex flex-col
        border bg-white p-6 dark:border-neutral-800 dark:bg-transparent"
      >
        <div className="h-max">
          <div className="flex justify-between">
            <label htmlFor="">Nhập tiếng trung</label>
            <div className="flex items-center gap-8 px-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <IUpload className="w-5 fill-neutral-500 dark:fill-neutral-300" />
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleUpload}
              />
              <button onClick={() => handleDel('in')}>
                <IDelete className="w-5 fill-neutral-500 dark:fill-neutral-300" />
              </button>
              <button onClick={() => handleCopy('in')}>
                <ICopy className="w-4 fill-neutral-500 dark:fill-neutral-300" />
              </button>
            </div>
          </div>

          <textarea
            className="mt-2 h-[50px] w-full rounded-sm border border-stone-200 bg-stone-50 
            p-2 outline-none dark:border-neutral-700 dark:bg-neutral-900"
            value={inputTxt}
            onChange={(e) => {
              setInputTxt(e.target.value);
            }}
          />

          <div>
            Settings
            <div></div>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-neutral-300 px-4 dark:border-neutral-600">
          <div className="flex items-center justify-between border-b py-1 dark:border-neutral-600">
            <label htmlFor="">Kết quả dịch</label>
            <div className="flex gap-8">
              <button onClick={() => handleCopy('out')}>
                <ICopy className="w-4 fill-neutral-500 dark:fill-neutral-300" />
              </button>
              <button onClick={handleDownload}>
                <IDownload className="w-5 fill-neutral-500 dark:fill-neutral-300" />
              </button>
            </div>
          </div>
          <div className="no-scrollbar h-[600px] mt-4 space-y-8 overflow-y-scroll text-justify">
            <Reader ref={readerRef} rawText={inputTxt} />
          </div>
        </div>
      </div>
    </div>
  );
}
