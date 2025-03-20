import React, { memo } from 'react';
import { cx, capitalizeFirstLetter } from '@/lib/utils';

interface ParagraphProps {
  paragraph: string[];
  zhParagraph: string[];
  parIndex: number;
  currentParPosition: number;
  selectedWordsPosition: number[];
  selectWord: (
    parIndex: number,
    wrdIndex: number,
    e: React.MouseEvent<HTMLSpanElement>,
  ) => void;
}

const Paragraph: React.FC<ParagraphProps> = ({
  paragraph,
  zhParagraph,
  parIndex,
  currentParPosition,
  selectedWordsPosition,
  selectWord,
}) => {
  return (
    <p>
      {paragraph.length > 0 &&
        paragraph.map((wordRaw, wrdIndex) => {
          const isHighlight =
            currentParPosition === parIndex &&
            selectedWordsPosition.includes(wrdIndex);
          const word = wordRaw.split('/')[0];

          if (wrdIndex === 0) {
            return (
              <span
                key={wrdIndex}
                onClick={(e) => selectWord(parIndex, wrdIndex, e)}
                className={cx(isHighlight && 'bg-orange-500 text-black')}
              >
                {capitalizeFirstLetter(word)}
              </span>
            );
          }
          if (/^[,”.:;?!]+$/.test(word)) return word;

          return (
            <span
              key={wrdIndex}
              onClick={(e) => selectWord(parIndex, wrdIndex, e)}
              className={cx(isHighlight && 'bg-orange-500 text-black')}
            >
              {' ' + word}
            </span>
          );
        })}
    </p>
  );
};

// Memoized Paragraph
export default memo(Paragraph);
