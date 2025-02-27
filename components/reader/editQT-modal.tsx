import React, { FormEvent, useEffect, useState } from 'react';
import { IClose, ICopy, IRight } from '../icons';
import { useQT } from '@/qt/QTContext';
import { createWord } from '@/lib/api';

interface EditQTModalProps {
  position: {
    top: number;
    left: number;
  };
  zhWord: string;
  viWord: string;
  otherWordMeaning: { wrdIndex: number; mean: string }[];

  closeModal: () => void;
  expandWord: (b: 1 | -1) => void;
}

export const EditQTModal: React.FC<EditQTModalProps> = ({
  position,
  zhWord,
  viWord,
  closeModal,
  expandWord,
  otherWordMeaning,
}) => {
  const [chineseWord, setChineseWord] = useState(zhWord);
  const [vietnameseWord, setVietNameseWord] = useState(viWord);
  const { addToPersonalDictionary, deleteWord } = useQT();

  useEffect(() => {
    setChineseWord(zhWord);
  }, [zhWord]);

  useEffect(() => {
    setVietNameseWord(viWord);
  }, [viWord]);

  function copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert(`✔️ Đã copy ${chineseWord}`);
    } else {
      console.error('Browser not support clipboard API');
    }
  }

  const handleSubmit = async (e: FormEvent, type: 'name' | 'vp') => {
    e.preventDefault();
    if (!chineseWord || !vietnameseWord || vietnameseWord === viWord) {
      alert('❌ Không hợp lệ, vui lòng xem hướng dẫn');
      return;
    }
    addToPersonalDictionary({ zh: chineseWord, vi: vietnameseWord });

    createWord(`${chineseWord.trim()}=${vietnameseWord.trim()}`, type);

    // const res = await fetch('/api/dict', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     filename: fileName,
    //     contents: `${chineseWord.trim()}=${vietnameseWord.trim()}`,
    //   }),
    // });

    // if (res.ok) {
    //   alert(
    //     `Đã thêm ${chineseWord}=${vietnameseWord} vào từ điển, load lại để sử dụng`
    //   );
    //   setChineseWord('');
    //   setVietNameseWord('');
    // }

    closeModal();
  };

  return (
    <>
      <div
        style={{
          top: position.top,
          left: position.left,
        }}
        className={`absolute z-50 w-full max-w-72 rounded-sm border border-gray-700 
         bg-sky-100 text-base text-[#1f1f1f]`}
      >
        <div>
          <div className="flex justify-between">
            <div className="flex space-x-1 text-gray-100">
              <button
                onClick={() => expandWord(-1)}
                className="flex items-center bg-sky-500 px-2 py-1"
              >
                <IRight className="h-3 w-3 rotate-180 fill-white" />
                Mở rộng
              </button>
              <button
                onClick={() => expandWord(1)}
                className="flex items-center bg-sky-500 px-2 py-1"
              >
                Mở rộng
                <IRight className="h-3 w-3 fill-white" />
              </button>
            </div>
            <button
              onClick={() => closeModal()}
              className="bg-red-500 p-1 px-3"
            >
              <IClose className="h-3 w-3 fill-white" />
            </button>
          </div>
          <div className="mt-3 p-2">
            <form action="" className="">
              <div className="flex items-center gap-1.5">
                <label className="w-6 shrink-0">CN</label>
                <input
                  value={chineseWord}
                  onChange={(e) => setChineseWord(e.target.value)}
                  type="text"
                  className="w-full rounded-md border border-gray-700 p-1"
                  required
                />
                <span
                  onClick={() => copyToClipboard(chineseWord)}
                  className="flex items-center rounded-sm bg-amber-600 p-1.5"
                >
                  <ICopy className="h-4 w-4 fill-white" />
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1">
                <label className="w-6 shrink-0">Vi</label>
                <input
                  value={vietnameseWord}
                  onChange={(e) => setVietNameseWord(e.target.value)}
                  type="text"
                  className="w-full rounded-md border border-gray-700 p-1"
                  required
                />
                <span
                  onClick={() => copyToClipboard(chineseWord)}
                  className="flex items-center rounded-sm bg-amber-600 p-1.5"
                >
                  <ICopy className="h-4 w-4 fill-white" />
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold">Nghĩa khác</label>
                <div className="text-xs">
                  {otherWordMeaning.map((w, i) => {
                    const meanArr = w.mean.split('/');
                    return (
                      <div className="inline" key={i}>
                        <span className="m-[1px] inline-block bg-amber-600 p-[2px]">
                          {meanArr[0]}
                        </span>
                        {meanArr.length > 1 && (
                          <span className="bg-amber-400 p-[2px]">
                            {`(` + meanArr.slice(1).join('/') + ')'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* submit bts */}
              <div className="mr-2 mt-6 flex justify-end space-x-2">
                <button
                  className="rounded-md bg-rose-800 px-2 text-white hover:bg-rose-400"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteWord(chineseWord);
                    closeModal();
                  }}
                >
                  Xóa
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-amber-700 px-2 py-1 text-white hover:bg-amber-400"
                  onClick={(e) => {
                    handleSubmit(e, 'name');
                  }}
                >
                  Names
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-sky-700 px-2 py-1 text-white hover:bg-sky-400"
                  onClick={(e) => {
                    handleSubmit(e, 'vp');
                  }}
                >
                  VietPhrase
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
