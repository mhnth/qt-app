import React, { FormEvent, useEffect, useState } from 'react';
import { IClose, ICopy, IRight } from '../icons';
import { useQT } from '@/qt/QTContext';
import { createWord, deleteWordDict } from '@/lib/api';
import { cx } from '@/lib/utils';

interface EditQTModalProps {
  position: {
    top: number;
    left: number;
  };
  zhWord: string;
  viWord: string;
  otherWordMeaning: { wrdIndex: number; mean: string }[];

  closeModal: () => void;
  rerender: () => void;
  expandWord: (b: 1 | -1) => void;
}

export const EditQTModal: React.FC<EditQTModalProps> = ({
  position,
  zhWord,
  viWord,
  closeModal,
  expandWord,
  otherWordMeaning,
  rerender,
}) => {
  const [chineseWord, setChineseWord] = useState(zhWord);
  const [vietnameseWord, setVietNameseWord] = useState(viWord);
  const [deletedWord, setDeletedWord] = useState('');
  const { addToPersonalDictionary, deleteWordLocal } = useQT();

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

    closeModal();
  };

  const toggleWord = (w: string) => {
    if (!deletedWord) {
      setDeletedWord(chineseWord);
      console.log('del3', deletedWord, w);

      deleteWordLocal(w);
    } else {
      addToPersonalDictionary({ zh: chineseWord, vi: vietnameseWord });
      setDeletedWord('');
    }

    rerender();
  };

  const handleDelete = () => {
    deleteWordDict(`${chineseWord}=${vietnameseWord}`);
    setDeletedWord('');
    closeModal();
  };

  const handleExpandWord = (b: 1 | -1) => {
    expandWord(b);
    if (deletedWord) {
      addToPersonalDictionary({ zh: chineseWord, vi: vietnameseWord });
    }
    setDeletedWord('');
  };

  const handleClose = () => {
    if (deletedWord) {
      addToPersonalDictionary({ zh: chineseWord, vi: vietnameseWord });
      setDeletedWord('');
    }

    closeModal();
  };

  return (
    <>
      <div
        style={{
          top: position.top,
          left: position.left,
        }}
        className={`absolute z-50 w-full max-w-72 rounded-sm border border-gray-600 
         bg-slate-800 text-base text-[#1f1f1f]`}
      >
        <>
          <div className="flex justify-between">
            <div className="flex space-x-1 text-gray-100">
              <button
                onClick={() => handleExpandWord(-1)}
                className="flex items-center bg-sky-700 px-2 py-1"
              >
                <IRight className="h-3 w-3 rotate-180 fill-white" />
                Trái
              </button>
              <button
                onClick={() => handleExpandWord(1)}
                className="flex items-center bg-sky-700 px-2 py-1"
              >
                Phải
                <IRight className="h-3 w-3 fill-white" />
              </button>
            </div>
            <button
              onClick={() => handleClose()}
              className="bg-red-500 p-1 px-3"
            >
              <IClose className="h-3 w-3 fill-white" />
            </button>
          </div>

          <div className="p-3 pb-0">
            <div className="text-xs">
              {otherWordMeaning.map((w, i) => {
                const meanArr = w.mean.split('/');
                return (
                  <div className="inline" key={i}>
                    <span className="m-[1px] inline-block text-amber-500">
                      {meanArr[0]}
                    </span>
                    {meanArr.length > 1 && (
                      <span className="text-slate-400">
                        {`(` + meanArr.slice(1).join('/') + ')'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-1 p-2 text-sm text-slate-200">
            <div className="rounded-md border border-slate-700 bg-slate-900 text-base">
              <div className="flex items-center gap-1.5 border-b border-slate-700 px-1">
                <input
                  value={chineseWord}
                  onChange={(e) => setChineseWord(e.target.value)}
                  type="text"
                  className="w-full rounded-md bg-transparent p-2 outline-none"
                  required
                />
                <span
                  onClick={() => copyToClipboard(chineseWord)}
                  className="flex cursor-pointer items-center rounded-sm p-1.5"
                >
                  <ICopy className="h-4 w-4 fill-white" />
                </span>
              </div>

              <div className="flex items-center gap-1 border-b border-slate-600 px-1">
                <input
                  value={vietnameseWord}
                  onChange={(e) => setVietNameseWord(e.target.value)}
                  type="text"
                  className="w-full rounded-md bg-transparent p-2 outline-none"
                  required
                />
                <span
                  onClick={() => copyToClipboard(chineseWord)}
                  className="flex cursor-pointer items-center rounded-sm p-1.5"
                >
                  <ICopy className="h-4 w-4 fill-white" />
                </span>
              </div>

              <div className={'space-x-2 p-2 text-sm text-slate-400'}>
                <button
                  disabled={otherWordMeaning.length > 1}
                  className="rounded-sm border-slate-500 px-2 py-1"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWord(chineseWord);
                  }}
                >
                  {deletedWord ? 'quay lại' : 'thử xoá'}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  className={cx(
                    'rounded-md py-1',
                    deletedWord ? 'text-rose-500' : 'hidden',
                  )}
                >
                  xoá hẳn
                </button>
              </div>
            </div>

            {/* submit bts */}
            <div className="mr-2 mt-6 flex justify-end space-x-2">
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
          </div>
        </>
      </div>
    </>
  );
};
