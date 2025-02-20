'use client';

import { ICopy, IDelete, IDownload, IUpload } from '@/components/icons';
import { Reader } from '@/components/reader/reader';
import { splitIntoChunks } from '@/lib/utils';
import { useQT } from '@/qt/QTContext';
import { useEffect, useState } from 'react';

import { Virtuoso } from 'react-virtuoso';

export default function TranslatePage() {
  const { translateQT } = useQT();
  const [inputTxt, setInputTxt] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [textParts, setTextParts] = useState<string[]>([]);

  useEffect(() => {
    const savedInputTxt = sessionStorage.getItem('inputTxt');
    const savedOutputFileName = sessionStorage.getItem('outputFileName');
    if (savedInputTxt) setInputTxt(savedInputTxt);
    if (savedOutputFileName) setOutputFileName(savedOutputFileName);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('inputTxt', inputTxt);
    // sessionStorage.setItem('outputFileName', outputFileName);

    const textChunks = splitIntoChunks(inputTxt);
    setTextParts(inputTxt ? textChunks || [] : []);
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
    <div className="mx-auto max-w-4xl text-white">
      <div
        className="md:h-max md:mt-6 h-[100vh] w-full md:rounded-md flex flex-col bg-neutral-800 
                   border md:p-8 p-5 bg-opacity-60 shadow-md border-neutral-600"
      >
        <div className="">
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
            className="mt-2 h-[100px] w-full outline-none rounded-sm border border-neutral-500 
            p-4 bg-neutral-700 bg-opacity-50"
            value={inputTxt}
            onChange={(e) => setInputTxt(e.target.value)}
          />
        </div>

        <div className="mt-3 rounded-md px-4 border border-neutral-600">
          <div className="">
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
            <div className="md:h-[500px] mt-4 h-[400px]">
              <Virtuoso
                id="virtuoso-container"
                style={{ height: '100%' }}
                totalCount={textParts.length}
                itemContent={(index) => (
                  <div
                    className="virtuoso-scroller" // Đảm bảo phần tử container có class này
                  >
                    <Reader rawText={textParts[index]} />
                  </div>
                )}
                increaseViewportBy={300}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
