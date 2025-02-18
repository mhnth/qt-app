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
  const CHUNK_SIZE = 10000; // Kích thước mỗi lần tải thêm
  const MAX_VISIBLE_TEXT = 20000; // Giới hạn tối đa chữ hiển thị

  const { translateQT } = useQT();

  const [inputTxt, setInputTxt] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [visibleText, setVisibleText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const readerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load dữ liệu từ sessionStorage khi khởi động
  useEffect(() => {
    const savedInputTxt = sessionStorage.getItem('inputTxt');
    const savedOutputFileName = sessionStorage.getItem('outputFileName');

    if (savedInputTxt) setInputTxt(savedInputTxt);
    if (savedOutputFileName) setOutputFileName(savedOutputFileName);
  }, []);

  // Lưu input vào sessionStorage khi thay đổi
  useEffect(() => {
    sessionStorage.setItem('inputTxt', inputTxt);
    sessionStorage.setItem('outputFileName', outputFileName);
  }, [inputTxt, outputFileName]);

  // Cắt nhỏ văn bản ban đầu và cập nhật hiển thị
  useEffect(() => {
    setVisibleText(inputTxt.slice(0, CHUNK_SIZE));
    setCurrentIndex(CHUNK_SIZE);
  }, [inputTxt]);

  // Xóa nội dung
  const handleDel = () => {
    setInputTxt('');
    setOutputFileName('');
    setVisibleText('');
    setCurrentIndex(0);
  };

  // Sao chép nội dung hiển thị vào clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(visibleText);
    alert('✔️ Đã sao chép kết quả vào khay nhớ tạm');
  };

  // Xử lý tải file văn bản lên
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

  // Tải file kết quả xuống
  // const handleDownload = () => {
  //   const blob = new Blob([visibleText], { type: 'text/plain' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = outputFileName;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

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

  // Load thêm nội dung khi sentinel xuất hiện
  const loadMoreText = () => {
    if (currentIndex >= inputTxt.length) return;

    const nextIndex = Math.min(currentIndex + CHUNK_SIZE, inputTxt.length);
    setVisibleText((prev) => {
      // Cắt bớt phần đầu nếu đã vượt quá giới hạn chữ hiển thị
      const newText = prev + inputTxt.slice(currentIndex, nextIndex);
      if (newText.length > MAX_VISIBLE_TEXT) {
        return newText.slice(newText.length - MAX_VISIBLE_TEXT); // Giới hạn số lượng chữ
      }
      return newText;
    });
    setCurrentIndex(nextIndex);
  };

  // Sử dụng Intersection Observer để tải nội dung khi sentinel xuất hiện
  useEffect(() => {
    if (!sentinelRef.current || !readerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreText();
        }
      },
      {
        root: readerRef.current, // Gán root là container cuộn
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
  }, [currentIndex, inputTxt]);

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
