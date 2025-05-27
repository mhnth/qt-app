type JiebaToken = string[]; // [word, pos_tag]
type ProcessedToken = {
  text: string;
  pos: string; // Vẫn giữ lại từ loại gốc để áp dụng các quy tắc tiếp theo
  rawWord: string; // Giữ lại từ gốc tiếng Trung nếu cần cho việc gộp zh
};

export function processZh2ViGrammar(
  zhTokens: string[], // Mảng các từ tiếng Trung gốc
  viTokensWithPos: string[], // Mảng các từ tiếng Việt đã có từ loại
): { zh: string[]; vi: string[] } {
  // Chuyển đổi viTokensWithPos sang định dạng dễ sử dụng hơn
  const tokens: ProcessedToken[] = viTokensWithPos.map((item, index) => {
    const [meanings, pos] = item.split('|');
    const firstMeaning = meanings.split('/')[0];
    return {
      text: firstMeaning,
      pos: pos,
      rawWord: zhTokens[index], // Lấy từ tiếng Trung tương ứng
    };
  });

  const outputProcessedTokens: ProcessedToken[] = [];
  let i = 0;

  while (i < tokens.length) {
    const currentToken = tokens[i];
    const nextToken = tokens[i + 1];
    const prevToken = tokens[i - 1];

    let ruleApplied = false;

    // --- Quy tắc 1: Cụm Định ngữ với '的' (u) ---
    // Điều kiện: [Định ngữ] + 的(u) + [Danh từ]
    // Ví dụ: 父母的 -> của phụ mẫu
    // 注意: Ở đây cần đảm bảo Danh từ không bị trùng lặp với danh từ chính khi tìm cụm định ngữ
    if (
      currentToken.pos === 'u' &&
      nextToken &&
      ['n', 'nr', 'ns', 'nt', 'v'].includes(nextToken.pos) && // Sau 'của' là một danh từ chính
      prevToken && // Phải có từ đứng trước 'của' để làm định ngữ
      ['n', 'r', 'a', 'd', 'v', 'm', 'q'].includes(prevToken.pos) // Từ đứng trước là danh từ, đại từ, tính từ, trạng từ, động từ, số từ, lượng từ
    ) {
      // Tìm cụm định ngữ đứng trước 'của'
      const qualifierTokens: ProcessedToken[] = [];
      let j = i - 1;

      while (j >= 0) {
        const tempPrevToken = tokens[j];
        if (
          ['n', 'r', 'a', 'd', 'v', 'm', 'q'].includes(tempPrevToken.pos) &&
          (j === 0 || // Nếu là từ đầu câu
            (tokens[j - 1] &&
              !['p', 'c', 'x'].includes(tokens[j - 1].pos) && // Không phải giới từ, liên từ, dấu câu
              !['u'].includes(tokens[j - 1].pos))) // Không phải một 'ของ' khác
        ) {
          qualifierTokens.unshift(tempPrevToken);
          j--;
        } else {
          break;
        }
      }

      if (qualifierTokens.length > 0) {
        const mainNounToken = nextToken; // Danh từ chính
        const qualifierWords = qualifierTokens.map((t) => t.text).join(' '); // Cụm định ngữ

        // Xóa các token đã xử lý khỏi outputProcessedTokens nếu chúng đã được thêm vào
        // Đây là điểm cần cẩn trọng nếu bạn dùng cách thêm từng bước
        // Với cách tiếp cận mới, chúng ta sẽ xây dựng lại mảng từ đầu hoặc dùng buffer
        // Vì vậy, ta sẽ không pop từ outputProcessedTokens ở đây nữa.

        // Thêm danh từ chính
        outputProcessedTokens.push(mainNounToken);
        // Thêm 'của' (nếu cần)
        outputProcessedTokens.push({ text: 'của', pos: 'u', rawWord: '的' });
        // Thêm cụm định ngữ
        outputProcessedTokens.push({
          text: qualifierWords,
          pos: 'phrase',
          rawWord: qualifierTokens.map((t) => t.rawWord).join(''), // Gộp từ zh
        });

        // Di chuyển con trỏ i qua các token đã xử lý
        i += 2; // Bỏ qua 'ของ' và danh từ chính
        i -= qualifierTokens.length; // Điều chỉnh lại i để bỏ qua các từ định ngữ đã xử lý
        ruleApplied = true;
      }
    }

    // --- Quy tắc 2: Giới từ (f) đứng sau Danh từ ---
    // Ví dụ: 想法中 -> bên trong ý nghĩ
    // Điều kiện: [Cụm Danh từ] + Giới từ (f)
    // Cần đảm bảo quy tắc này được áp dụng sau quy tắc 'ของ' nếu cần
    if (
      !ruleApplied &&
      currentToken.pos === 'f' &&
      prevToken &&
      ['n', 'nr', 'ns', 'nt', 'phrase'].includes(prevToken.pos)
    ) {
      // Tìm cụm danh từ đứng trước giới từ
      const nounPhraseTokens: ProcessedToken[] = [];
      let j = i - 1;
      while (j >= 0) {
        const tempPrevToken = tokens[j];
        if (
          ['n', 'nr', 'ns', 'nt', 'phrase', 'a', 'd', 'm', 'q'].includes(
            tempPrevToken.pos,
          ) && // Có thể là danh từ, cụm danh từ, tính từ, trạng từ (trong cụm danh từ)
          (j === 0 ||
            (tokens[j - 1] &&
              !['p', 'c', 'x', 'u', 'v'].includes(tokens[j - 1].pos)))
        ) {
          // Không phải giới từ, liên từ, dấu câu, động từ (tách câu)
          nounPhraseTokens.unshift(tempPrevToken);
          j--;
        } else {
          break;
        }
      }

      if (nounPhraseTokens.length > 0) {
        const nounPhrase = nounPhraseTokens.map((t) => t.text).join(' ');

        // Lùi lại outputTokens để xóa các từ đã được thêm vào (nếu có)
        for (let k = 0; k < nounPhraseTokens.length; k++) {
          if (
            outputProcessedTokens.length > 0 &&
            outputProcessedTokens[outputProcessedTokens.length - 1].text ===
              nounPhraseTokens[nounPhraseTokens.length - 1 - k].text
          ) {
            outputProcessedTokens.pop();
          } else {
            // Nếu không khớp, có thể cụm từ đã được xử lý ở bước trước
            // hoặc đã có lỗi logic
            // Cần cẩn trọng khi pop
          }
        }

        outputProcessedTokens.push(currentToken); // Thêm giới từ trước
        outputProcessedTokens.push({
          text: nounPhrase,
          pos: 'phrase',
          rawWord: nounPhraseTokens.map((t) => t.rawWord).join(''),
        }); // Thêm cụm danh từ sau

        // Cập nhật chỉ số i để bỏ qua các token đã xử lý
        i += 1; // Bỏ qua giới từ hiện tại
        // Các token của cụm danh từ đã được xử lý thông qua `prevToken`
        // Không cần phải di chuyển `i` quá xa, vì chúng ta đã lùi lại và xử lý các token đó.
        // Điều này làm phức tạp logic, cần phải cẩn thận khi sử dụng `outputProcessedTokens.pop()`

        ruleApplied = true;
      }
    }

    // --- Các quy tắc khác (như trong hàm trước) ---
    // Bạn cần điều chỉnh các quy tắc này để phù hợp với định dạng ProcessedToken và logic gộp cụm từ.
    // Ví dụ:
    // Quy tắc 2: Trạng từ + 地 (u) + Động từ (d + u + v) -> Động từ + Trạng từ
    // Ví dụ: 慢慢/d 地/u 走/v -> Đi từ từ
    if (
      !ruleApplied &&
      currentToken.pos === 'u' && // Vị trí '地'
      i > 0 &&
      prevToken &&
      prevToken.pos === 'd' && // Từ trước là trạng từ
      nextToken &&
      nextToken.pos === 'v' // Từ sau là động từ
    ) {
      // Xóa trạng từ đã thêm nếu có
      if (
        outputProcessedTokens.length > 0 &&
        outputProcessedTokens[outputProcessedTokens.length - 1].text ===
          prevToken.text
      ) {
        outputProcessedTokens.pop();
      }
      outputProcessedTokens.push(nextToken); // Thêm động từ
      outputProcessedTokens.push(prevToken); // Thêm trạng từ
      i += 2; // Bỏ qua '地' và động từ
      ruleApplied = true;
    }

    // Quy tắc 3: Động từ + 得 (u) + Trạng từ (v + u + d) - Bổ ngữ trình độ
    // Ví dụ: 跑/v 得/u 很快/d -> Chạy rất nhanh
    if (
      !ruleApplied &&
      currentToken.pos === 'u' && // Vị trí '得'
      i > 0 &&
      prevToken &&
      prevToken.pos === 'v' && // Từ trước là động từ
      nextToken &&
      nextToken.pos === 'd' // Từ sau là trạng từ
    ) {
      // Xóa động từ đã thêm nếu có
      if (
        outputProcessedTokens.length > 0 &&
        outputProcessedTokens[outputProcessedTokens.length - 1].text ===
          prevToken.text
      ) {
        outputProcessedTokens.pop();
      }
      outputProcessedTokens.push(prevToken); // Thêm động từ
      outputProcessedTokens.push(nextToken); // Thêm trạng từ
      i += 2; // Bỏ qua '得' và trạng từ
      ruleApplied = true;
    }

    // Quy tắc 5: X 之处 (X/a 之处/n) -> Điểm X
    // Ví dụ: 优点/n 之处/n -> Điểm ưu điểm
    // Lưu ý: Jieba có thể phân tích '之处' là 'n' (danh từ) và '之' là 'u' (từ nối).
    // Giả sử '之处' được coi là một từ, hoặc '之处' là một cụm từ mà bạn muốn xử lý.
    // Ở đây, tôi sẽ giả định 'chỗ' là từ dịch của '之处'.
    if (
      !ruleApplied &&
      currentToken.text === 'chỗ' && // Dịch của 之处
      currentToken.pos === 'n' && // Từ loại của 'chỗ' là danh từ
      i > 0 &&
      prevToken &&
      ['n', 'a', 'v'].includes(prevToken.pos) // Từ trước là danh từ, tính từ, hoặc động từ
    ) {
      // Xóa từ trước đó nếu đã được thêm
      if (
        outputProcessedTokens.length > 0 &&
        outputProcessedTokens[outputProcessedTokens.length - 1].text ===
          prevToken.text
      ) {
        outputProcessedTokens.pop();
      }
      outputProcessedTokens.push(currentToken); // Thêm 'chỗ'
      outputProcessedTokens.push(prevToken); // Thêm từ X
      i++; // Bỏ qua 'chỗ'
      ruleApplied = true;
    }

    // Mặc định: Thêm từ trực tiếp nếu không có quy tắc đặc biệt nào áp dụng
    if (!ruleApplied) {
      outputProcessedTokens.push(currentToken);
      i++;
    }
  }

  // Kết quả cuối cùng: Gộp các cụm từ nếu có thể và định dạng đầu ra
  const finalZh: string[] = [];
  const finalVi: string[] = [];

  let currentViPhrase = '';
  let currentZhPhrase = '';

  for (let k = 0; k < outputProcessedTokens.length; k++) {
    const token = outputProcessedTokens[k];

    // Ở đây, bạn có thể thêm logic để gộp các từ lại thành cụm lớn hơn
    // Ví dụ: nếu token không phải là dấu câu, hãy gộp chúng lại.
    // Đối với trường hợp ví dụ của bạn "bên trong ý nghĩ của phụ mẫu",
    // chúng ta muốn nó là một chuỗi duy nhất.

    if (
      token.pos === 'phrase' ||
      token.pos === 'n' ||
      token.pos === 'v' ||
      token.pos === 'a' ||
      token.pos === 'd' ||
      token.pos === 'u' ||
      token.pos === 'f'
    ) {
      // Các từ có thể tạo thành cụm
      if (currentViPhrase === '') {
        currentViPhrase = token.text;
        currentZhPhrase = token.rawWord;
      } else {
        currentViPhrase += ' ' + token.text;
        currentZhPhrase += token.rawWord;
      }
    } else {
      // Nếu là dấu câu hoặc từ loại khác không gộp, push cụm hiện tại vào và reset
      if (currentViPhrase !== '') {
        finalVi.push(currentViPhrase);
        finalZh.push(currentZhPhrase);
        currentViPhrase = '';
        currentZhPhrase = '';
      }
      finalVi.push(token.text);
      finalZh.push(token.rawWord);
    }
  }

  // Đảm bảo cụm cuối cùng được thêm vào
  if (currentViPhrase !== '') {
    finalVi.push(currentViPhrase);
    finalZh.push(currentZhPhrase);
  }

  return { zh: finalZh, vi: finalVi };
}
// type JiebaToken = string[]; // [word, pos_tag]

// export function processZh2ViGrammar(jiebaTokens: JiebaToken): string[] {
//   const outputTokens: string[] = [];
//   let i = 0;

//   while (i < jiebaTokens.length) {
//     const [currentWord, currentPos] = jiebaTokens[i].split('|');

//     // --- Xử lý cụm Định ngữ với '的' ---
//     // Quy tắc 1: Cụm Định ngữ + 的 (u) + Danh từ (n) -> Danh từ + (của/mà/~) + Cụm Định ngữ
//     if (
//       currentPos === 'u' &&
//       // currentWord === '的' &&
//       i < jiebaTokens.length - 1 &&
//       ['n', 'nr', 'ns', 'nt'].includes(currentPos) // Sau '的' là một danh từ chính
//     ) {
//       const mainNoun = jiebaTokens[i + 1][0]; // Danh từ chính (ví dụ: 女孩, 书)

//       // 1. Tìm cụm định ngữ đứng trước '的'
//       const qualifierWords: string[] = [];
//       let j = i - 1; // Bắt đầu từ từ ngay trước '的'

//       // Lùi lại để thu thập các từ trong cụm định ngữ
//       // Điều kiện dừng:
//       // - Đã hết mảng
//       // - Gặp một từ là động từ chính của câu (chưa phải bổ nghĩa)
//       // - Gặp một dấu câu
//       // - Gặp một từ loại mà không hợp lý làm định ngữ cho danh từ tiếp theo (ví dụ: chủ ngữ khác)
//       // Đây là phần cần logic rất cẩn thận và có thể cần heuristic (ước lượng)
//       while (j >= 0) {
//         const [prevWord, prevPos] = jiebaTokens[j].split('|');

//         // Nếu là đại từ nhân xưng ở đầu cụm, có thể là chủ sở hữu
//         if (prevPos === 'r' && j === 0) {
//           qualifierWords.unshift(prevWord);
//           break;
//         }
//         // Nếu là tính từ, trạng từ, động từ (bổ nghĩa), danh từ (bổ nghĩa)
//         if (['a', 'd', 'v', 'n', 'm', 'q'].includes(prevPos)) {
//           qualifierWords.unshift(prevWord);
//           j--;
//         } else if (prevPos === 'p' || prevPos === 'c' || prevPos === 'x') {
//           // Giới từ, liên từ, dấu câu
//           break; // Dừng nếu gặp giới từ, liên từ, hoặc dấu câu
//         } else {
//           break; // Dừng nếu gặp từ loại không mong muốn
//         }
//       }

//       // Xác định số lượng token đã thu thập làm định ngữ
//       const numQualifierTokens = qualifierWords.length;
//       if (numQualifierTokens > 0) {
//         // Xóa các từ định ngữ đã được thêm vào outputTokens trước đó (nếu có)
//         // Đây là bước phức tạp, vì các từ có thể đã được thêm vào qua vòng lặp chính
//         // Cách đơn giản hơn là xử lý lại từ đầu hoặc dùng buffer
//         // Với cách làm này, ta sẽ lùi lại trong outputTokens và xóa.
//         for (let k = 0; k < numQualifierTokens; k++) {
//           if (
//             outputTokens.length > 0 &&
//             outputTokens[outputTokens.length - 1] ===
//               qualifierWords[numQualifierTokens - 1 - k]
//           ) {
//             outputTokens.pop();
//           }
//         }
//       }

//       outputTokens.push(mainNoun); // Thêm danh từ chính trước
//       // Quyết định dùng 'của' hay không
//       // Nếu cụm định ngữ là (đại từ/danh từ sở hữu) + X
//       if (
//         numQualifierTokens === 1 &&
//         ['r', 'n'].includes(jiebaTokens[i - 1].split('|')[1])
//       ) {
//         outputTokens.push('của'); // Thêm 'của' cho sở hữu
//       } else if (numQualifierTokens > 0) {
//         // Trường hợp phức tạp hơn, có thể cần 'mà', hoặc không cần từ nối
//         // Để đơn giản, ta sẽ chỉ thêm 'mà' nếu cụm định ngữ có động từ
//         if (
//           qualifierWords.some(
//             (w) => jiebaTokens.find((token) => token[0] === w)?.[1] === 'v',
//           )
//         ) {
//           outputTokens.push('mà'); // Thêm 'mà' nếu có động từ
//         }
//       }
//       outputTokens.push(...qualifierWords); // Thêm cụm định ngữ

//       i += 2; // Bỏ qua 'của' và danh từ chính
//       continue; // Chuyển sang vòng lặp tiếp theo
//     }

//     // --- Các quy tắc khác (như trong hàm trước) ---

//     // Quy tắc 2: Trạng từ + 地 (u) + Động từ (d + u + v) -> Động từ + Trạng từ
//     // Ví dụ: 慢慢/d 地/u 走/v -> Đi từ từ
//     if (
//       currentPos === 'u' &&
//       // currentWord === '地' &&
//       i > 0 &&
//       jiebaTokens[i - 1].split('|')[1] === 'd' &&
//       i < jiebaTokens.length - 1 &&
//       jiebaTokens[i + 1].split('|')[1] === 'v'
//     ) {
//       const prevWord = jiebaTokens[i - 1][0];
//       const nextWord = jiebaTokens[i + 1][0];

//       if (
//         outputTokens.length > 0 &&
//         outputTokens[outputTokens.length - 1] === prevWord
//       ) {
//         outputTokens.pop();
//       }
//       outputTokens.push(nextWord);
//       outputTokens.push(prevWord);
//       i += 2; // Bỏ qua '地' và động từ kế tiếp
//       continue;
//     }

//     // Quy tắc 3: Động từ + 得 (u) + Trạng từ (v + u + d) - Bổ ngữ trình độ
//     // Ví dụ: 跑/v 得/u 很快/d -> Chạy rất nhanh
//     if (
//       currentPos === 'u' &&
//       // currentWord === '得' &&
//       i > 0 &&
//       jiebaTokens[i - 1].split('|')[1] === 'v' &&
//       i < jiebaTokens.length - 1 &&
//       jiebaTokens[i + 1].split('|')[1] === 'd'
//     ) {
//       const prevWord = jiebaTokens[i - 1][0];
//       const nextWord = jiebaTokens[i + 1][0];

//       if (
//         outputTokens.length > 0 &&
//         outputTokens[outputTokens.length - 1] === prevWord
//       ) {
//         outputTokens.pop();
//       }
//       outputTokens.push(prevWord);
//       outputTokens.push(nextWord);
//       i += 2; // Bỏ qua '得' và trạng từ kế tiếp
//       continue;
//     }

//     // Quy tắc 5: X 之处 (X/a 之处/n) -> Điểm X
//     // Ví dụ: 优点/n 之处/n -> Điểm ưu điểm
//     if (
//       currentPos === 'r' &&
//       currentWord === 'chỗ' &&
//       i > 0 &&
//       ['n', 'a', 'v'].includes(jiebaTokens[i - 1].split('|')[1])
//     ) {
//       const prevWord = jiebaTokens[i - 1].split('|')[0];
//       if (
//         outputTokens.length > 0 &&
//         outputTokens[outputTokens.length - 1] === prevWord
//       ) {
//         outputTokens.pop();
//       }
//       outputTokens.push('chỗ');
//       outputTokens.push(prevWord);
//       i++; // Bỏ qua '之处'
//       continue;
//     }

//     // Mặc định: Thêm từ trực tiếp nếu không có quy tắc đặc biệt nào áp dụng
//     outputTokens.push(currentWord);
//     i++;
//   }

//   return outputTokens;
// }
