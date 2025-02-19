'use client';

import React, {
  ForwardedRef,
  HTMLAttributes,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { capitalizeFirstLetter, cx, splitArray } from '@/lib/utils';

import { EditQTModal } from './editQT-modal';
import { useQT } from '@/qt/QTContext';
import { Spinner } from '../spinner';

interface ReaderProps extends HTMLAttributes<HTMLDivElement> {
  rawText: string;
  ref?: ForwardedRef<HTMLDivElement>;
}

export const Reader: React.FC<ReaderProps> = ({ rawText, ref, ...props }) => {
  const { loading, getQTPairs } = useQT();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [currentParPosition, setCurrentParPosition] = useState(0);
  const [currentWordPosition, setCurrentWordPosition] = useState(0);
  const [selectedWordsPosition, setSelectedWordsPosition] = useState<number[]>(
    []
  );

  const [zhWord, setZhWord] = useState<string>('');
  const [viWord, setViWord] = useState<string>('');
  const [otherWordMeaning, setOtherWordMeaning] = useState<
    {
      wrdIndex: number;
      mean: string;
    }[]
  >([
    {
      wrdIndex: 0,
      mean: '',
    },
  ]);

  useEffect(() => {
    let otherWordMeaning: any[] = [];

    const zhWords = selectedWordsPosition
      .map((wordIndex) => zhParagraphs[currentParPosition][wordIndex])
      .join('');
    const viWords = selectedWordsPosition
      .map((wordIndex) => {
        otherWordMeaning.push({
          wrdIndex: wordIndex || 0,
          mean: viParagraphs[currentParPosition][wordIndex] || '',
        });

        return viParagraphs[currentParPosition][wordIndex].split('/')[0];
      })
      .join(' ');

    setZhWord(() => zhWords);
    setViWord(() => viWords);
    setOtherWordMeaning(otherWordMeaning);
  }, [currentWordPosition]);

  if (loading)
    return (
      <div className="flex justify-center gap-2 items-center fixed inset-0 backdrop-sepia-1 bg-black/40">
        {/* <Skeleton message="Loading QT Dictionary, please wait" /> */}
        <Spinner />
        Loading Dictionary...
      </div>
    );

  const qtPairs = getQTPairs(rawText);
  if (!qtPairs) return <></>;

  const { zhArr, viArr } = qtPairs;
  const viParagraphs = splitArray(viArr, '\n');

  const zhParagraphs = splitArray(zhArr, '\n');

  const selectWord2 = (e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.target as HTMLElement;

    // Lấy thông tin từ thuộc tính data-word
    const zhWord = target.getAttribute('data-word-zh') || '';
    const viWord = target.getAttribute('data-word-vi') || '';

    // Lấy vị trí modal
    const spanRect = target.getBoundingClientRect();
    let modalTop = spanRect.bottom + window.scrollY + 10;
    let modalLeft = spanRect.left + window.scrollX;

    if (modalLeft + 300 > window.innerWidth) {
      modalLeft = window.innerWidth - 310;
    }

    // Cập nhật trạng thái
    setModalPosition({ top: modalTop, left: modalLeft });
    setModalVisible(true);
    setZhWord(zhWord);
    setViWord(viWord);
  };

  const selectWord1 = (
    parIndex: number,
    wrdIndex: number,
    e: React.MouseEvent<HTMLSpanElement>
  ) => {
    // open modal
    const spanRect = (e.target as HTMLElement).getBoundingClientRect();
    let modalTop = spanRect.bottom + window.scrollY + 10;
    let modalLeft = spanRect.left + window.scrollX;

    if (modalLeft + 300 > window.innerWidth) {
      modalLeft = window.innerWidth - 310;
    }

    setModalPosition({ top: modalTop, left: modalLeft });
    setModalVisible(true);

    //set word
    setZhWord(() => zhParagraphs[parIndex][wrdIndex]);
    setViWord(() => viParagraphs[parIndex][wrdIndex]);

    //set word coord
    setCurrentParPosition(parIndex);
    setCurrentWordPosition(wrdIndex);
    setSelectedWordsPosition([wrdIndex]);
  };

  const handleExpandWord = (b: 1 | -1) => {
    const newIndex = currentWordPosition + b;
    // handle special positions
    if (
      newIndex === -1 ||
      newIndex > viParagraphs[currentParPosition].length - 1
    )
      return;

    if (selectedWordsPosition.includes(newIndex)) {
      setSelectedWordsPosition(
        selectedWordsPosition.filter((i) => i !== currentWordPosition)
      );
    } else {
      const newArr =
        b === 1
          ? [...selectedWordsPosition, newIndex]
          : [newIndex, ...selectedWordsPosition];
      setSelectedWordsPosition(newArr);
    }

    setCurrentWordPosition(newIndex);
  };

  const selectWord = (
    parIndex: number,
    wrdIndex: number,
    e: React.MouseEvent<HTMLSpanElement>
  ) => {
    const target = e.target as HTMLElement;
    const spanRect = target.getBoundingClientRect();

    // 📌 Lấy vị trí của Virtuoso Scroller
    const virtuosoScroller = document.querySelector(
      '#virtuoso-container'
    ) as HTMLElement;
    if (!virtuosoScroller) return;

    const virtuosoRect = virtuosoScroller.getBoundingClientRect();
    const virtuosoScrollTop = virtuosoScroller.scrollTop; // 🛠 Lấy vị trí scroll thực tế

    // 🔄 Tính vị trí modal theo container (không bị lệch khi cuộn)
    let modalTop = spanRect.bottom - virtuosoRect.top + virtuosoScrollTop + 10;
    let modalLeft = spanRect.left - virtuosoRect.left;

    // console.log(
    //   'spanRect:',
    //   spanRect.top,
    //   spanRect.left,
    //   'modal:',
    //   modalTop,
    //   modalLeft,
    //   'virtuoso:',
    //   virtuosoRect.top,
    //   virtuosoScrollTop
    // );

    // 🛑 Giữ modal trong màn hình
    const modalWidth = 300;
    const containerWidth = virtuosoRect.width;
    if (modalLeft + modalWidth > containerWidth) {
      modalLeft = containerWidth - modalWidth - 10;
    }
    if (modalLeft < 0) {
      modalLeft = 10;
    }

    setModalPosition({ top: modalTop, left: modalLeft });
    setModalVisible(true);

    setZhWord(zhParagraphs[parIndex][wrdIndex]);
    setViWord(viParagraphs[parIndex][wrdIndex]);

    setCurrentParPosition(parIndex);
    setCurrentWordPosition(wrdIndex);
    setSelectedWordsPosition([wrdIndex]);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWordsPosition([]);
  };

  return (
    <>
      <article
        ref={ref}
        {...props}
        className="mx-auto max-w-4xl h-max px-2 md:px-6"
      >
        <div
          className="mx-auto max-w-4xl px-2
          text-justify font-normal leading-10 md:px-16"
        >
          {viParagraphs.map((p, parIndex) => {
            return (
              <div key={parIndex} className="contents">
                <p key={parIndex}>
                  {p.map((wordRaw, wrdIndex) => {
                    const isHighlight =
                      currentParPosition === parIndex &&
                      selectedWordsPosition.includes(wrdIndex);

                    const word = wordRaw.split('/')[0];

                    if (wrdIndex === 0) {
                      return (
                        <span
                          data-word-zh={zhParagraphs[parIndex][wrdIndex]}
                          data-word-vi={viParagraphs[parIndex][wrdIndex]}
                          onClick={(e) => selectWord(parIndex, wrdIndex, e)}
                          className={cx(
                            isHighlight && 'bg-orange-500 text-black'
                          )}
                          key={wrdIndex}
                        >
                          {capitalizeFirstLetter(word)}
                        </span>
                      );
                    }
                    if (/^[,”.:;?!]+$/.test(word)) return word;
                    if (/^[.?]+$/.test(p[wrdIndex - 1])) {
                      return (
                        <span
                          data-word-zh={zhParagraphs[parIndex][wrdIndex]}
                          data-word-vi={viParagraphs[parIndex][wrdIndex]}
                          onClick={(e) => {
                            selectWord(parIndex, wrdIndex, e);
                          }}
                          key={wrdIndex}
                          className={cx(
                            // 'spank',
                            isHighlight && 'bg-orange-500 text-black'
                          )}
                        >
                          {' ' + capitalizeFirstLetter(word)}
                        </span>
                      );
                    }
                    if (p[wrdIndex - 1] === '“')
                      return (
                        <span
                          data-word-zh={zhParagraphs[parIndex][wrdIndex]}
                          data-word-vi={viParagraphs[parIndex][wrdIndex]}
                          onClick={(e) => {
                            selectWord(parIndex, wrdIndex, e);
                          }}
                          className={cx(
                            isHighlight && 'bg-orange-500 text-black'
                          )}
                          key={wrdIndex}
                        >
                          {capitalizeFirstLetter(word)}
                        </span>
                      );

                    return (
                      <span
                        data-word-zh={zhParagraphs[parIndex][wrdIndex]}
                        data-word-vi={viParagraphs[parIndex][wrdIndex]}
                        onClick={(e) => {
                          selectWord(parIndex, wrdIndex, e);
                        }}
                        key={wrdIndex}
                        className={cx(
                          // 'spank',
                          isHighlight && 'bg-orange-500 text-black'
                        )}
                      >
                        {' ' + word}
                      </span>
                    );
                  })}
                </p>
                <br />
              </div>
            );
          })}
        </div>

        {/* Edit Words Modal */}
        {modalVisible && (
          <EditQTModal
            otherWordMeaning={otherWordMeaning}
            position={{
              top: modalPosition.top,
              left: modalPosition.left,
            }}
            zhWord={zhWord}
            viWord={viWord}
            closeModal={closeModal}
            expandWord={handleExpandWord}
          />
        )}
      </article>
    </>
  );
};
