'use client';

import {
  IBook,
  IDelete,
  IDownload,
  ILanguage,
  IReload,
} from '@/components/icons';
import { Spinner } from '@/components/spinner';
import { useQT } from '@/qt/QTContext';
import Link from 'next/link';
import { useState } from 'react';

export default function DictPage() {
  const [inputZh, setInputZh] = useState('');
  const [inputVi, setInputVi] = useState('');

  const {
    getPersonalDictionary,
    addToPersonalDictionary,
    updatePersonalDictionary,
    revalidate,
    loading,
  } = useQT();

  const existingDict = getPersonalDictionary();

  const [dict, setDict] = useState(existingDict);

  const handleAddWord = () => {
    const newDict = [...dict];
    newDict.push([inputZh, inputVi]);

    setDict(newDict);
    addToPersonalDictionary({ zh: inputZh, vi: inputVi });
  };

  const handleDeleteWord = (index: number) => {
    const newDict = [...dict];
    newDict.splice(index, 1);

    updatePersonalDictionary(newDict);
    setDict(() => newDict);
  };

  const handleDownload = () => {
    if (dict.length === 0) {
      return;
    }

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;

    const timeTitle = `${year
      .toString()
      .slice(2)}${formattedMonth}${formattedDay}`;

    const textContent = dict.map((p, i) => `${p[0]}=${p[1]}`).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'TuDienCaNhan-' + timeTitle + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="flex justify-center gap-2 items-center fixed inset-0 backdrop-sepia-1 bg-black/40">
        {/* <Skeleton message="Loading QT Dictionary, please wait" /> */}
        <Spinner />
        Cập nhật file từ điển
      </div>
    );

  return (
    <div className="min-h-screen p-2">
      <div
        className="mx-auto max-w-5xl text-white bg-neutral-800 bg-opacity-60 shadow-md mt-6 
                   rounded-md border-neutral-600"
      >
        <div className="">
          <div className="px-6 p-2 bg-opacity-65 flex gap-4 font-light">
            <Link
              className="text-neutral-300 flex gap-1 items-center"
              href={'/'}
            >
              <ILanguage className="fill-current w-4 h-4" />
              Dịch
            </Link>
            <Link href={'/dict'} className="flex items-center gap-1">
              <IBook className="fill-current w-3 h-4" />
              Từ điển cá nhân
            </Link>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between mt-2">
              <div className="flex flex-col md:flex-row mb-4 md:mb-0 gap-2 md:gap-4">
                <input
                  onChange={(e) => setInputZh(e.target.value)}
                  type="text"
                  placeholder="Tiếng trung"
                  className="bg-neutral-900 bg-opacity-50 p-1 px-4 rounded-md outline-none"
                />
                <input
                  onChange={(e) => setInputVi(e.target.value)}
                  type="text"
                  placeholder="Nghĩa"
                  className="bg-neutral-900 bg-opacity-50 p-1 px-4 rounded-md outline-none"
                />
              </div>
              <button
                onClick={handleAddWord}
                className="px-4 py-1 bg-neutral-700 rounded-md hover:bg-neutral-400"
              >
                +Thêm từ
              </button>
            </div>

            <div className="flex justify-end mt-6">
              <div className="flex gap-5">
                <button
                  onClick={revalidate}
                  title="reload từ điển server"
                  className="flex items-center gap-2"
                >
                  {/* Reload từ điển server{' '} */}
                  <IReload className="fill-neutral-300 w-5" />
                </button>
                <button
                  onClick={handleDownload}
                  title="tải về file từ điển cá nhân"
                  className="flex items-center gap-2"
                >
                  {/* Tải về file từ điển */}
                  <IDownload className="fill-neutral-300 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-2">
              {dict.map((p, i) => {
                const bg = i % 2 === 0 && 'bg-neutral-800';
                return (
                  <div
                    key={i}
                    className={
                      'w-full flex justify-between bg-opacity-50 p-2 px-4' +
                      ' ' +
                      bg
                    }
                  >
                    <div className="flex w-3/4">
                      <div className="w-1/2 px-1">{p[0]}</div>
                      <div className="px-1">{p[1]}</div>
                    </div>
                    <button onClick={() => handleDeleteWord(i)}>
                      <IDelete className="fill-neutral-100 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
