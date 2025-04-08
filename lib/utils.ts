// src: https://github.com/alexnault/classix/blob/main/src/index.ts

type Argument = string | boolean | null | undefined;

/**
 * Conditionally join classNames into a single string
 * @param {...String} args The expressions to evaluate
 * @returns {String} The joined classNames
 */
function cx(...args: Argument[]): string;
function cx(): string {
  let str = '',
    i = 0,
    arg: unknown;

  for (; i < arguments.length; ) {
    if ((arg = arguments[i++]) && typeof arg === 'string') {
      str && (str += ' ');
      str += arg;
    }
  }
  return str;
}
export { cx };

export function formDataToObject<T>(formData: FormData) {
  if (Array.from(formData.entries()).length === 0) {
    return null;
  }

  return Array.from(formData.entries()).reduce((object, [key, value]) => {
    return {
      ...object,
      [key]: value,
    };
  }, {}) as T;
}
export const truncateStr = (
  input: string,
  max: number,
  dot: boolean = false,
): string => {
  if (input.length > max && dot) {
    return `${input.substring(0, max)}...`;
  } else if (!dot) {
    return `${input.substring(0, max)}...`;
  }

  return input;
};

export function splitArray<T>(arr: T[], delimiter: T): T[][] {
  return arr.reduce<T[][]>((acc, item) => {
    if (item === delimiter) {
      acc.push([]);
    } else {
      if (acc.length === 0) acc.push([]);
      acc[acc.length - 1].push(item);
    }
    return acc;
  }, []);
}

export const formatTxt1 = (text: string) => {
  return text
    .replace(/ +([,.?!\]\>:};)])/g, '$1 ')
    .replace(/ +([”’])/g, '$1')
    .replace(/([<\[(“‘{]) +/g, ' $1')
    .replace(
      /(^\s*|[“‘”’.!?\[-]\s*)(\p{Ll})/gmu,
      (_, p1, p2) => p1 + p2.toUpperCase(),
    )
    .replace(/ +/g, ' ')
    .replace('「', ' "') // Thay dấu mở 「 bằng dấu "
    .replace('」', '" ') // Thay dấu đóng 」 bằng dấu "
    .replace(/"\s*(.*?)\s*"/g, (_, content) => `"${content.trim()}"`)
    .replace(/(\bChương\s+\d+)\s+(\w)/i, (_, chapter, firstLetter) => {
      // Nếu có từ sau số chương, thêm dấu `:` và viết hoa chữ cái đầu
      if (firstLetter) {
        return `${chapter}: ${firstLetter.toUpperCase()}`;
      }
      // Nếu không có từ nào sau số chương, giữ nguyên tiêu đề
      return chapter;
    });
};

export const formatTxt = (text: string) => {
  return text
    .replace(/ +([,.?!\]\>:};)])/g, '$1 ') // Đảm bảo có một khoảng trắng sau dấu câu
    .replace(/ +([”’])/g, '$1') // Loại bỏ khoảng trắng dư thừa trước dấu " và '
    .replace(/([<\[(“‘{]) +/g, ' $1') // Loại bỏ khoảng trắng dư thừa sau các dấu mở ngoặc
    .replace(
      /(^\s*|[“‘”’.!?\[-]\s*)(\p{Ll})/gmu,
      (_, p1, p2) => p1 + p2.toUpperCase(),
    ) // Viết hoa chữ cái đầu sau dấu câu
    .replace(/ +/g, ' ') // Loại bỏ khoảng trắng dư thừa
    .replace('「', ' "') // Thay dấu mở 「 bằng dấu "
    .replace('」', '" ') // Thay dấu đóng 」 bằng dấu "
    .replace(/"\s*(.*?)\s*"/g, (_, content) => `"${content.trim()}"`) // Trim dấu ngoặc kép
    .replace(/(\bChương\s+\d+)\s+(\w)/i, (_, chapter, firstLetter) => {
      // Nếu có từ sau số chương, thêm dấu `:` và viết hoa chữ cái đầu
      if (firstLetter) {
        return `${chapter}: ${firstLetter.toUpperCase()}`;
      }
      // Nếu không có từ nào sau số chương, giữ nguyên tiêu đề
      return chapter;
    })
    .replace(/(\n|\r\n|\r)/g, '\n'); // Thêm 2 lần xuống dòng sau mỗi đoạn
};

export function formatNumber(value: number): string {
  if (!value) return 'N/A';

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'k';
  } else {
    return value.toString();
  }
}

export function capitalizeWords(inputString: string) {
  return inputString
    ?.toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const setItemLocalStorage = (key: string, value: any) => {
  try {
    const json = JSON.stringify(value);
    localStorage.setItem(key, json);
  } catch (error) {
    console.log('ERR saving to localstorage:', error);
  }
};

export const getItemLocalStorage = (key: string) => {
  try {
    const json = localStorage.getItem(key);
    if (json === null) {
      return null;
    }

    return JSON.parse(json);
  } catch (error) {
    console.log('ERR retrieving from local storage:', error);
    return null;
  }
};

// chia chương bình thường theo tiêu đề
// export function splitIntoChunks(text: string, max = 20000) {
//   // Cập nhật regex để nhận diện đúng tiêu đề chương
//   const chapterRegex = /第[一二三四五六七八九十0-9]+章[:：]?[^\n]*/g;
//   const chapters = [];
//   let match;
//   let lastIndex = 0;
//   let prevTitle = null;

//   while ((match = chapterRegex.exec(text)) !== null) {
//     const chapterTitle = match[0];
//     const chapterContent = text.slice(lastIndex, match.index).trim();

//     // Nếu đây là chương đầu tiên, kiểm tra phần giới thiệu
//     if (!prevTitle && lastIndex === 0 && chapterContent) {
//       chapters.push('Intro\n' + chapterContent);
//     }

//     // Nếu có nội dung trước tiêu đề chương, thêm vào danh sách
//     if (prevTitle && chapterContent) {
//       chapters.push(prevTitle + '\n' + chapterContent);
//     }

//     prevTitle = chapterTitle;
//     lastIndex = chapterRegex.lastIndex;
//   }

//   // Xử lý chương cuối cùng
//   const finalChapterContent = text.slice(lastIndex).trim();
//   if (finalChapterContent && prevTitle) {
//     chapters.push(prevTitle + '\n' + finalChapterContent);
//   }

//   return chapters;
// }

// chia chương và lưu danh sách chương vào localStorage

export function splitIntoChapters_(text: string, max = 20000) {
  const chapterRegex = /第[一二三四五六七八九十0-9]+章[:：]?[^\n]*/g;
  const chapters = [];
  const chapterTitles = [];
  let match;
  let lastIndex = 0;
  let prevTitle = null;

  while ((match = chapterRegex.exec(text)) !== null) {
    const chapterTitle = match[0];
    chapterTitles.push(chapterTitle); // Lưu tiêu đề chương vào mảng

    const chapterContent = text.slice(lastIndex, match.index).trim();

    if (!prevTitle && lastIndex === 0 && chapterContent) {
      chapters.push(chapterContent);
      chapterTitles.unshift('intro');
    }

    if (prevTitle && chapterContent) {
      chapters.push(prevTitle + '\n' + chapterContent);
    }

    prevTitle = chapterTitle;
    lastIndex = chapterRegex.lastIndex;
  }

  const finalChapterContent = text.slice(lastIndex).trim();
  if (finalChapterContent && prevTitle) {
    chapters.push(prevTitle + '\n' + finalChapterContent);
  }

  // ✅ Lưu danh sách tiêu đề chương vào localStorage
  // localStorage.setItem('chapterTitles', JSON.stringify(chapterTitles));

  return [chapters, chapterTitles];
}

export function splitIntoChapters(text: string, max = 2000000, subMax = 10000) {
  const chapterRegex = /第[一二三四五六七八九十零百千万两0-9]+章[:：]?[^\n]*/g;
  const chapters: string[] = [];
  const chapterTitles: string[] = [];
  let match;
  let lastIndex = 0;
  let prevTitle: string | null = null;

  while ((match = chapterRegex.exec(text)) !== null) {
    const chapterTitle = match[0];
    chapterTitles.push(chapterTitle);

    let chapterContent = text.slice(lastIndex, match.index).trim();
    if (!prevTitle && lastIndex === 0 && chapterContent) {
      chapters.push(chapterContent);
      chapterTitles.unshift('肇端');
    }

    if (prevTitle && chapterContent) {
      if (chapterContent.length > max) {
        splitLongChapter(
          prevTitle + '\n' + chapterContent,
          subMax,
          chapters,
          chapterTitles,
        );
      } else {
        chapters.push(prevTitle + '\n' + chapterContent);
      }
    }

    prevTitle = chapterTitle;
    lastIndex = chapterRegex.lastIndex;
  }

  const finalChapterContent = text.slice(lastIndex).trim();
  if (finalChapterContent && prevTitle) {
    if (finalChapterContent.length > max) {
      splitLongChapter(
        prevTitle + '\n' + finalChapterContent,
        subMax,
        chapters,
        chapterTitles,
      );
    } else {
      chapters.push(prevTitle + '\n' + finalChapterContent);
    }
  }

  // ❌ Nếu không có chương, chia nhỏ text
  if (chapters.length === 0) {
    splitLongChapter(text, max, chapters, chapterTitles, 'Phần');
  }

  return [chapters, chapterTitles];
}

/**
 * Chia nhỏ chương nếu dài hơn `limit`, giữ đoạn hoàn chỉnh.
 * Nếu chương có tiêu đề, các phần nhỏ sẽ có tiêu đề tương tự.
 */
function splitLongChapter(
  chapterText: string,
  limit: number,
  chapters: string[],
  chapterTitles: string[],
  prefix: string = '',
) {
  let start = 0;
  let partIndex = 1;
  while (start < chapterText.length) {
    let end = start + limit;

    if (end < chapterText.length) {
      const searchLimit = Math.max(start, end - 5000);
      const lastNewline = chapterText.lastIndexOf('\n\n', end);

      if (lastNewline > searchLimit) {
        end = lastNewline;
      }
    }

    chapters.push(chapterText.slice(start, end).trim());
    chapterTitles.push(
      prefix ? `${prefix} ${chapters.length}` : `part ${partIndex}`,
    );

    start = end;
    partIndex++;
  }
}

export function swapAdjacentWords(arr: string[]): string[] {
  // Duyệt qua mảng từ cuối đến đầu để tránh thay đổi chỉ số khi xóa phần tử
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === 'đích') {
      // Kiểm tra nếu phần tử 'đích' không phải phần tử đầu hay cuối mảng
      if (i > 0 && i < arr.length - 1) {
        // Đổi chỗ hai phần tử cạnh 'đích'
        [arr[i - 1], arr[i + 1]] = [arr[i + 1], arr[i - 1]];
      }
      // Loại bỏ phần tử 'đích'
      // arr.splice(i, 1);
    }
  }

  return arr;
}

export function swapAdjacentWords3(
  result: string[],
  target: string,
  zhArr?: string[],
): string[] {
  const toReverseWords = new Set([
    'mẫu thân',
    'tỷ',
    'đệ',
    'ta',
    'phụ thân',
    'ma ma',
    'muội',
    'đêm',
    'chính',
  ]);
  const swapToRightWords = new Set(['cho ta', 'nhất', 'kia']);
  const swapToLeftWords = new Set(['bên trong']);

  // Sao chép mảng để không thay đổi gốc
  const processedResult = [...result];

  // Vòng lặp 1: Xử lý swapToLeftWords và swapToRightWords trước
  for (let i = 0; i < processedResult.length; i++) {
    // Xử lý swap sang trái
    if (i > 0 && swapToLeftWords.has(processedResult[i].split('/')[0])) {
      [processedResult[i], processedResult[i - 1]] = [
        processedResult[i - 1],
        processedResult[i],
      ];
      i++; // Bỏ qua phần tử đã swap để tránh xử lý lại
      continue;
    }

    // Xử lý swap sang phải
    if (
      i < processedResult.length - 1 &&
      swapToRightWords.has(processedResult[i].split('/')[0])
    ) {
      [processedResult[i], processedResult[i + 1]] = [
        processedResult[i + 1],
        processedResult[i],
      ];
      i++; // Bỏ qua phần tử đã swap để tránh xử lý lại
    }
  }

  // Vòng lặp 2: Xử lý target sau khi đã swap các từ khác
  for (let i = 0; i < processedResult.length; i++) {
    if (
      processedResult[i] === target &&
      i > 0 &&
      i < processedResult.length - 1
    ) {
      const prev = processedResult[i - 1].split('/')[0];
      const next = processedResult[i + 1].split('/')[0];
      if (
        toReverseWords.has(prev) ||
        toReverseWords.has(next) ||
        /[A-Z]/.test(prev) ||
        /[A-Z]/.test(next)
      ) {
        console.log('jahh');
        [processedResult[i - 1], processedResult[i + 1]] = [next, prev];
        processedResult[i] = 'của';
        i++; // Bỏ qua phần tử đã xử lý
      }
    }
  }

  return processedResult;
}

// export function convertToVietnamese(phrases: string[]): string[] {
//   let result: string[] = [];
//   let i = 0;

//   while (i < phrases.length) {
//     const [currentPhrase, currentPos] = phrases[i].split('|');
//     const next = i + 1 < phrases.length ? phrases[i + 1].split('|') : ['', ''];
//     const [nextPhrase, nextPos] = next;

//     // Xử lý "的" (uj) - ưu tiên cao nhất vì liên quan đến cấu trúc sở hữu hoặc miêu tả
//     if (currentPos === 'uj') {
//       if (i > 0 && i < phrases.length - 1) {
//         let prevPhrases: string[] = [];
//         let nextPhrases: string[] = [];
//         let j = i - 1;
//         let k = i + 1;
//         while (j >= 0) {
//           const [prevPhrase, prevPos] = phrases[j].split('|');
//           if (['v', 'd', 'uz', 'p', 'u'].includes(prevPos)) {
//             break;
//           }
//           prevPhrases.unshift(prevPhrase);
//           j--;
//         }

//         while (k < phrases.length - 1) {
//           const [nextPhrase, nextPos] = phrases[k].split('|');
//           if (['v', 'd', 'uz', 'p', 'u'].includes(nextPos)) {
//             break;
//           }
//           nextPhrases.push(nextPhrase);
//           k++;
//         }

//         // if (nounPhrase.length > 0) {
//         //   result.splice(-nounPhrase.length, nounPhrase.length);
//         // }

//         // if (
//         //   nounPhrase.length === 1 &&
//         //   phrases[i - 1].split('|')[1] === 'a' &&
//         //   (nextPos === 'n' || nextPos === 'nr')
//         // ) {
//         //   result.push(nextPhrase, nounPhrase[0]); // Danh từ + Tính từ
//         //   i += 2;
//         //   continue;
//         // } else if (nextPos === 'n') {
//         //   const compoundNoun = nounPhrase.join(' ');
//         //   result.push(nextPhrase, 'của', compoundNoun); // Danh từ + "của" + Cụm danh từ
//         //   i += 2;
//         //   continue;
//         // }

//         result.splice(-prevPhrases.length);

//         result.push(...nextPhrases, 'của', ...prevPhrases);

//         i += k;
//         continue;
//       }
//     }

//     // Xử lý "般" (bān) - so sánh
//     else if (currentPos === 'u' && currentPhrase === 'bàn') {
//       if (i > 0 && i < phrases.length - 1) {
//         let nounPhrase: string[] = [];
//         let j = i - 1;
//         while (j >= 0) {
//           const [prevPhrase, prevPos] = phrases[j].split('/');
//           if (['v', 'd', 'uz', 'p', 'u'].includes(prevPos)) {
//             break;
//           }
//           nounPhrase.unshift(prevPhrase);
//           j--;
//         }
//         if (nounPhrase.length > 0) {
//           result.splice(-nounPhrase.length, nounPhrase.length);
//           if (nextPos === 'a') {
//             result.push(nextPhrase, 'như', nounPhrase.join(' ')); // Tính từ + "như" + Cụm danh từ
//             i += 2;
//             continue;
//           }
//         }
//       }
//     }

//     // Xử lý "里" (lǐ) - bên trong
//     else if (currentPos === 'f' && currentPhrase === 'lý') {
//       if (i > 0) {
//         const prevPhrase = result.pop() || '';
//         result.push('bên trong', prevPhrase);
//         i += 1;
//         continue;
//       }
//     }

//     // Xử lý "上" (shàng) - bên trên
//     else if (currentPos === 'f' && currentPhrase === 'thượng') {
//       if (i > 0) {
//         const prevPhrase = result.pop() || '';
//         result.push('bên trên', prevPhrase);
//         i += 1;
//         continue;
//       }
//     }

//     // Mặc định: Thêm từ vào kết quả
//     result.push(currentPhrase);
//     i += 1;
//   }

//   return result;
// }

export function convertToVietnamese(phrases: string[]): string[] {
  let result: string[] = [];
  let i = 0;

  while (i < phrases.length) {
    const [currentPhrase, currentPos] = phrases[i].split('|');
    const next = i + 1 < phrases.length ? phrases[i + 1].split('|') : ['', ''];
    const [nextPhrase, nextPos] = next;

    // Xử lý "的" (uj)
    if (currentPos === 'uj' && currentPhrase === 'đích') {
      if (i > 0 && i < phrases.length - 1) {
        // Thu thập cụm trước "đích"
        let prevPhrases: string[] = [];
        let j = i - 1;
        while (j >= 0) {
          const [prevPhrase, prevPos] = phrases[j].split('|');
          if (
            ['v', 'd', 'uz', 'p', 'u'].includes(prevPos) ||
            ['.', ',', '!', '?', ';', ':'].includes(prevPhrase)
          ) {
            break;
          }
          prevPhrases.unshift(prevPhrase);
          j--;
        }

        // Thu thập cụm sau "đích", dừng lại khi gặp dấu câu
        let nextPhrases: string[] = [];
        let k = i + 1;
        while (k < phrases.length) {
          const [afterPhrase, afterPos] = phrases[k].split('|');
          // Dừng nếu gặp từ loại không thuộc cụm danh từ hoặc dấu câu
          if (
            ['v', 'd', 'uz', 'p', 'u'].includes(afterPos) ||
            ['.', ',', '!', '?', ';', ':'].includes(afterPhrase)
          ) {
            break;
          }
          nextPhrases.push(afterPhrase);
          k++;
        }

        // Xóa các từ đã thêm trước đó khỏi result
        if (prevPhrases.length > 0) {
          result.splice(-prevPhrases.length, prevPhrases.length);
        }

        // Trường hợp 1: Tính từ + 的 + Danh từ -> Danh từ + Tính từ
        if (
          prevPhrases.length === 1 &&
          phrases[i - 1].split('|')[1] === 'a' &&
          (nextPos === 'n' || nextPos === 'nr') &&
          nextPhrases.length === 1
        ) {
          result.push(nextPhrase, prevPhrases[0]);
          i += 2;
          continue;
        }
        // Trường hợp 2: Cụm phức tạp trước và sau "đích"
        else if (nextPhrases.length > 0) {
          // Tách lượng từ (m) nếu có ở đầu cụm trước "đích"
          let quantifier: string | null = null;
          if (
            prevPhrases.length > 0 &&
            phrases[i - prevPhrases.length].split('|')[1] === 'm'
          ) {
            quantifier = prevPhrases.shift()!; // Lấy lượng từ đầu tiên (ví dụ: "một cái")
          }

          // Thêm lượng từ (nếu có) trước cụm sau "đích"
          if (quantifier) {
            result.push(quantifier);
          }
          // Thêm cụm sau "đích" (danh từ chính)
          result.push(...nextPhrases);

          // Thêm "của" và cụm trước "đích" (nếu còn)
          if (prevPhrases.length > 0) {
            result.push('đíchh', ...prevPhrases);
          }

          i = k; // Bỏ qua toàn bộ cụm đã xử lý
          continue;
        }
      }
    }

    // Xử lý "般" (bān) - so sánh
    else if (currentPos === 'u' && currentPhrase === 'bàn') {
      if (i > 0 && i < phrases.length - 1) {
        let nounPhrase: string[] = [];
        let j = i - 1;
        while (j >= 0) {
          const [prevPhrase, prevPos] = phrases[j].split('|');
          if (['v', 'd', 'uz', 'p', 'u'].includes(prevPos)) {
            break;
          }
          nounPhrase.unshift(prevPhrase);
          j--;
        }
        if (nounPhrase.length > 0) {
          result.splice(-nounPhrase.length, nounPhrase.length);
          if (nextPos === 'a') {
            result.push(nextPhrase, 'như', nounPhrase.join(' '));
            i += 2;
            continue;
          }
        }
      }
    }

    // Xử lý "里" (lǐ) - bên trong
    // else if (currentPos === 'f') {
    //   if (i > 0) {
    //     const prevPhrase = result.pop() || '';
    //     result.push('bên trong', prevPhrase);
    //     i += 1;
    //     continue;
    //   }
    // }

    // Xử lý "上" (shàng) - bên trên
    // else if (currentPos === 'f' && currentPhrase === 'thượng') {
    //   if (i > 0) {
    //     const prevPhrase = result.pop() || '';
    //     result.push('bên trên', prevPhrase);
    //     i += 1;
    //     continue;
    //   }
    // }

    // Mặc định: Thêm từ vào kết quả
    result.push(currentPhrase);
    i += 1;
  }

  return result;
}

// // Test với ví dụ của bạn
// const t = convertToVietnamese([
//   'khi đó|r',
//   'rất nhiều|m',
//   'nông thôn|n',
//   'người đều|n',
//   'có|v',
//   'trọng nam khinh nữ|n',
//   'đích|uj',
//   'quen thuộc|a',
// ]);
// console.log('test', t);

// // Test với cụm danh từ sau "的"
// const t2 = convertToVietnamese([
//   'phía trên|f',
//   'còn có|v',
//   'một cái|m',
//   'lớn|x',
//   'ta|x',
//   'mười tuổi|m',
//   'đích|uj',
//   'tỷ tỷ|n',
//   '.',
// ]);
// console.log('test2', t2);
export function splitIntoChunks(input: string, max: number = 1000): string[] {
  const chunks = [];
  let start = 0;
  while (start < input.length) {
    console.log('run', input.length);

    let end = start + max;
    if (end < input.length) {
      // Tìm vị trí xuống dòng gần nhất trước max length
      end = input.lastIndexOf('\n', end);
      if (end === -1) {
        end = start + max;
      } else {
        end++; // Xuống dòng nằm tại end position
      }
    }
    chunks.push(input.substring(start, end));
    start = end;
  }
  return chunks;
}
