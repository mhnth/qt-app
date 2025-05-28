export function processZh2ViGrammar(
  zhTokens: string[], // Mảng các từ tiếng Trung gốc
  viTokensWithPos: string[], // Mảng các từ tiếng Việt đã có từ loại
): { zh: string[]; vi: string[] } {
  const newViTokens: string[] = [];
  const newZhTokens: string[] = [];

  let i = 0;

  while (i < viTokensWithPos.length) {
    const [currentWord, currentPos] = viTokensWithPos[i].split('|');
    const currentRawWord = zhTokens[i]; // Từ gốc tiếng Trung

    // --- Xử lý cụm Định ngữ với '的' ---
    // Quy tắc 1: Cụm Định ngữ + 的 (u) + Danh từ (n) -> Danh từ + (của/mà/~) + Cụm Định ngữ
    if (currentPos === 'uj' && i < viTokensWithPos.length - 1) {
      let phrase = [];
      let rawPhrase = [currentRawWord];

      const [nextWord, nextPos] = viTokensWithPos[i + 1].split('|');
      if (!['n', 'nr', 'ns', 'nt'].includes(nextPos)) {
        newViTokens.push('');
        i++;
        continue;
      }

      const mainNoun = viTokensWithPos[i + 1].split('|')[0]; // Danh từ chính
      rawPhrase.push(zhTokens[i + 1]);

      // 1. Tìm cụm định ngữ đứng trước '的'
      const qualifierWords: string[] = [];
      let j = i - 1; // Bắt đầu từ từ ngay trước '的'

      // Lùi lại để thu thập các từ trong cụm định ngữ
      // Điều kiện dừng:
      // - Đã hết mảng
      // - Gặp một từ là động từ chính của câu (chưa phải bổ nghĩa)
      // - Gặp một dấu câu
      // - Gặp một từ loại mà không hợp lý làm định ngữ cho danh từ tiếp theo (ví dụ: chủ ngữ khác)
      // Đây là phần cần logic rất cẩn thận và có thể cần heuristic (ước lượng)
      while (j >= 0) {
        const [prevWord, prevPos] = viTokensWithPos[j].split('|');

        // Nếu là đại từ nhân xưng ở đầu cụm, có thể là chủ sở hữu
        if (prevPos === 'r' && j === 0) {
          qualifierWords.unshift(prevWord);
          break;
        }
        // Nếu là tính từ, trạng từ, động từ (bổ nghĩa), danh từ (bổ nghĩa)
        if (['a', 'd', 'v', 'n', 'm', 'q'].includes(prevPos)) {
          qualifierWords.unshift(prevWord);
          j--;
        } else if (prevPos === 'p' || prevPos === 'c' || prevPos === 'x') {
          // Giới từ, liên từ, dấu câu

          break; // Dừng nếu gặp giới từ, liên từ, hoặc dấu câu
        } else {
          break; // Dừng nếu gặp từ loại không mong muốn
        }
      }

      // Xác định số lượng token đã thu thập làm định ngữ
      const numQualifierTokens = qualifierWords.length;
      if (numQualifierTokens > 0) {
        // Xóa các từ định ngữ đã được thêm vào outputTokens trước đó (nếu có)
        // Đây là bước phức tạp, vì các từ có thể đã được thêm vào qua vòng lặp chính
        // Cách đơn giản hơn là xử lý lại từ đầu hoặc dùng buffer
        // Với cách làm này, ta sẽ lùi lại trong outputTokens và xóa.
        for (let k = 0; k < numQualifierTokens; k++) {
          if (
            newViTokens.length > 0 &&
            newViTokens[newViTokens.length - 1] ===
              qualifierWords[numQualifierTokens - 1 - k]
          ) {
            newViTokens.pop();
          }
        }
      }

      phrase.push(mainNoun); // Thêm danh từ chính trước
      // Quyết định dùng 'của' hay không
      // Nếu cụm định ngữ là (đại từ/danh từ sở hữu) + X
      if (
        numQualifierTokens === 1 &&
        ['r', 'n'].includes(viTokensWithPos[i - 1].split('|')[1])
      ) {
        phrase.push('của');
      } else if (numQualifierTokens > 0) {
      }
      phrase.push(...qualifierWords);

      phrase = phrase.map((w) => w.split('/')[0]);

      newViTokens.push(phrase.join(' ') + '|phrase');

      i += 2; // Bỏ qua 'của' và danh từ chính
      continue; // Chuyển sang vòng lặp tiếp theo
    }

    // --- Các quy tắc khác---

    // --- Quy tắc 2: Giới từ (f) đứng sau Danh từ ---
    if (
      currentPos === 'f' &&
      i > 0 &&
      ['n', 'nr', 'ns', 'nt', 'phrase'].includes(
        newViTokens[newViTokens.length - 1].split('|')[1],
      )
    ) {
      // Tìm cụm danh từ đứng trước giới từ
      const nounPhraseTokens: string[] = [];
      let rawPhrase = [currentRawWord];

      let j = newViTokens.length - 1;
      while (j >= 0) {
        const [tempPrevToken, prevPos] = newViTokens[j].split('|');
        if (
          ['n', 'nr', 'ns', 'nt', 'phrase', 'a', 'd', 'm', 'q'].includes(
            prevPos,
          ) && // Có thể là danh từ, cụm danh từ, tính từ, trạng từ (trong cụm danh từ)
          (j === 0 ||
            (newViTokens[j - 1] &&
              !['p', 'c', 'x', 'u', 'v'].includes(
                newViTokens[j - 1].split('|')[1],
              ))) // Không phải giới từ, liên từ, dấu câu, động từ
        ) {
          // Không phải giới từ, liên từ, dấu câu, động từ (tách câu)
          nounPhraseTokens.unshift(tempPrevToken);
          rawPhrase.unshift(zhTokens[j]);
          j--;
        } else {
          break;
        }
      }

      if (nounPhraseTokens.length > 0) {
        const nounPhrase = nounPhraseTokens.map((t) => t.split('/')).join(' ');

        for (let k = 0; k < nounPhraseTokens.length; k++) {
          if (newViTokens.length > 0) {
            newViTokens.pop();
          } else {
          }
        }

        const newPhrase =
          currentWord.split('/')[0] + ' ' + nounPhrase + '|phrase';

        newViTokens.push(newPhrase);

        i++;
        continue;
      }
    }

    // Quy tắc 3: X 之处 (X/a 之处/n) -> Điểm X
    // Ví dụ: 优点/n 之处/n -> Điểm ưu điểm
    if (
      currentPos === 'r' &&
      currentWord === 'chỗ' &&
      i > 0 &&
      ['n', 'a', 'v'].includes(viTokensWithPos[i - 1].split('|')[1])
    ) {
      const prevWord = viTokensWithPos[i - 1].split('|')[0];
      if (
        newViTokens.length > 0 &&
        newViTokens[newViTokens.length - 1] === prevWord
      ) {
        newViTokens.pop();
      }

      const newPhrase = 'chỗ' + ' ' + prevWord + '|phrase'; // Tạo cụm mới

      newViTokens.push(newPhrase);

      i++; // Bỏ qua '之处'
      continue;
    }

    // Mặc định: Thêm từ trực tiếp nếu không có quy tắc đặc biệt nào áp dụng
    newViTokens.push(currentWord);
    i++;
  }

  return { zh: newZhTokens, vi: newViTokens };
}
