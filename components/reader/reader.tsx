'use client';

import Link from 'next/link';
import React, {
  ForwardedRef,
  HTMLAttributes,
  useEffect,
  useState,
} from 'react';
import { capitalizeFirstLetter, cx, splitArray } from '@/lib/utils';

import { EditQTModal } from './editQT-modal';
import { useQT } from '@/qt/QTContext';

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
      <div className="flex justify-center items-center fixed inset-0 backdrop-sepia-0 bg-white/30">
        {/* <Skeleton message="Loading QT Dictionary, please wait" /> */}
        Loading Dictionary...
      </div>
    );

  const qtPairs = getQTPairs(rawText);
  if (!qtPairs) return <></>;

  const { zhArr, viArr } = qtPairs;
  const viParagraphs = splitArray(viArr, '\n');

  const zhParagraphs = splitArray(zhArr, '\n');

  const selectWord = (
    e: React.MouseEvent<HTMLSpanElement>,
    parIndex: number,
    wrdIndex: number
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

  const closeModal = () => {
    setModalVisible(false);
    setSelectedWordsPosition([]);
  };

  return (
    <>
      <article
        ref={ref}
        {...props}
        className="mx-auto max-w-4xl px-2 pb-28 md:px-6"
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
                          onClick={(e) => selectWord(e, parIndex, wrdIndex)}
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
                          onClick={(e) => {
                            selectWord(e, parIndex, wrdIndex);
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
                          onClick={(e) => {
                            selectWord(e, parIndex, wrdIndex);
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
                        onClick={(e) => {
                          selectWord(e, parIndex, wrdIndex);
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
