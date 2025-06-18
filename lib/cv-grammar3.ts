export function processZh2ViGrammar(
  zhTokens: string[], // Mảng các từ tiếng Trung gốc (Array 1)
  viTokensWithPos: string[], // Mảng các từ tiếng Việt đã có từ loại (Array 2)
): { zh: string[]; vi: string[] } {
  return { zh: zhTokens, vi: viTokensWithPos };
  const newViTokens: string[] = [];
  const newZhTokens: string[] = [];

  let i = 0; // Con trỏ cho mảng gốc

  while (i < viTokensWithPos.length) {
    const [currentViWord, currentPos] = viTokensWithPos[i].split('|');
    const currentZhWord = zhTokens[i]; // Từ gốc tiếng Trung tương ứng

    let processed = false; // Cờ để biết một quy tắc đã được áp dụng hay chưa

    // --- Quy tắc 1: Cụm Định ngữ với '的' (uj) + Danh từ (n) ---
    // Ví dụ: 他的书 (tā de shū) -> Sách của anh ấy
    // zhTokens: ["他", "的", "书"] (processed -> "他的书")
    // viTokensWithPos: ["anh ấy|r", "của|uj", "sách|n"] (processed -> "Sách của anh ấy")
    if (currentPos === 'uj' && i < viTokensWithPos.length - 1) {
      const [nextViWord, nextPos] = viTokensWithPos[i + 1].split('|');

      // Đảm bảo từ tiếp theo là danh từ
      if (['n', 'nr', 'ns', 'nt'].includes(nextPos)) {
        const mainNounVi = nextViWord;
        const mainNounZh = zhTokens[i + 1]; // Từ tiếng Trung của danh từ chính

        // 1. Tìm cụm định ngữ đứng trước '的'
        const qualifierViWords: string[] = [];
        const qualifierZhWords: string[] = []; // Thu thập các từ tiếng Trung tương ứng
        let qualifierStartIdx = i - 1; // Bắt đầu từ từ ngay trước '的'

        while (qualifierStartIdx >= 0) {
          const [prevViWord, prevPos] =
            viTokensWithPos[qualifierStartIdx].split('|');
          const prevZhWord = zhTokens[qualifierStartIdx]; // Lấy từ tiếng Trung tương ứng

          // Điều kiện dừng:
          if (prevPos === 'r' && qualifierStartIdx === 0) {
            qualifierViWords.unshift(prevViWord);
            qualifierZhWords.unshift(prevZhWord);
            break;
          }
          if (['a', 'd', 'v', 'n', 'm', 'q'].includes(prevPos)) {
            qualifierViWords.unshift(prevViWord);
            qualifierZhWords.unshift(prevZhWord);
            qualifierStartIdx--;
          } else if (['p', 'c', 'x'].includes(prevPos)) {
            break;
          } else {
            break;
          }
        }

        const numQualifierTokens = qualifierViWords.length;

        // --- Xây dựng cụm tiếng Việt đã dịch (ĐẢO THỨ TỰ) ---
        // Chuỗi các từ tiếng Việt gốc trong cụm (định ngữ + của + danh từ)
        // Ví dụ: ["anh ấy", "của", "sách"] -> "sách của anh ấy"
        let viPhraseParts: string[] = [];
        viPhraseParts.push(mainNounVi); // Danh từ chính đứng đầu

        if (
          numQualifierTokens === 1 &&
          ['r', 'n'].includes(viTokensWithPos[i - 1].split('|')[1])
        ) {
          viPhraseParts.push('của'); // Thêm "của" nếu là sở hữu
        }

        if (numQualifierTokens > 0) {
          viPhraseParts.push(...qualifierViWords); // Thêm các từ định ngữ
        }

        // Nối các phần tử tiếng Việt lại để tạo cụm cuối cùng
        const newViPhrase = viPhraseParts.join(' ') + '|phrase';
        newViTokens.push(newViPhrase);

        // --- Xây dựng chuỗi tiếng Trung tương ứng (KHÔNG ĐẢO THỨ TỰ) ---
        // Gộp các zhTokens từ vị trí bắt đầu định ngữ đến danh từ chính (bao gồm '的')
        const zhPhraseStart = i - numQualifierTokens;
        const zhPhraseEnd = i + 1; // Index của danh từ chính
        // Nối các từ tiếng Trung theo ĐÚNG thứ tự ban đầu
        const newZhPhrase = zhTokens
          .slice(zhPhraseStart, zhPhraseEnd + 1)
          .join('');
        newZhTokens.push(newZhPhrase);

        // Di chuyển con trỏ 'i' tới sau cụm đã xử lý
        i += numQualifierTokens + 2; // Bỏ qua: các từ định ngữ, 'ของ', danh từ chính
        processed = true;
      }
    }

    // --- Các quy tắc khác (cần cập nhật tương tự nếu có gộp từ) ---

    // Quy tắc 2: Giới từ (f) đứng sau Danh từ
    // Ví dụ: 在学校 (zài xuéxiào) -> Ở trường học
    // zhTokens: ["在", "学校"]
    // viTokensWithPos: ["ở|f", "trường học|n"]
    // Mong muốn: newViTokens -> ["trường học ở|phrase"], newZhTokens -> ["在学校"]
    if (
      currentPos === 'f' &&
      i > 0 &&
      ['n', 'nr', 'ns', 'nt', 'phrase'].some((pos) =>
        viTokensWithPos[i - 1].split('|')[1].includes(pos),
      ) // Kiểm tra từ trước là danh từ hoặc cụm danh từ
    ) {
      // Tìm cụm danh từ đứng trước giới từ
      const nounPhraseViTokens: string[] = [];
      const nounPhraseZhTokens: string[] = [];
      let j = i - 1; // Bắt đầu từ từ ngay trước giới từ

      while (j >= 0) {
        const [tempPrevViToken, prevPos] = viTokensWithPos[j].split('|');
        const tempPrevZhToken = zhTokens[j];

        // Nếu là danh từ, cụm danh từ, tính từ, trạng từ (trong cụm danh từ)
        if (
          ['n', 'nr', 'ns', 'nt', 'phrase', 'a', 'd', 'm', 'q'].some((pos) =>
            prevPos.includes(pos),
          )
        ) {
          // Kiểm tra xem từ trước đó có phải là giới từ, liên từ, dấu câu, động từ (tách câu) không
          if (
            j === 0 ||
            !['p', 'c', 'x', 'u', 'v'].some((pos) =>
              viTokensWithPos[j - 1].split('|')[1].includes(pos),
            )
          ) {
            nounPhraseViTokens.unshift(tempPrevViToken);
            nounPhraseZhTokens.unshift(tempPrevZhToken);
            j--;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      if (nounPhraseViTokens.length > 0) {
        // Xóa các từ đã được thêm vào newViTokens và newZhTokens trước đó
        // Tương ứng với số lượng token trong nounPhraseTokens
        for (let k = 0; k < nounPhraseViTokens.length; k++) {
          if (newViTokens.length > 0) newViTokens.pop();
          if (newZhTokens.length > 0) newZhTokens.pop(); // Pop cả từ tiếng Trung tương ứng
        }

        // --- Tạo cụm tiếng Việt mới (ĐẢO THỨ TỰ) ---
        // Giới từ đứng sau danh từ
        const viParts = [...nounPhraseViTokens, currentViWord.split('/')[0]]; // ví dụ: ["trường học", "ở"]
        const newViPhrase = viParts.join(' ') + '|phrase';
        newViTokens.push(newViPhrase);

        // --- Tạo cụm tiếng Trung mới (KHÔNG ĐẢO THỨ TỰ) ---
        // Từ tiếng Trung gốc của cụm danh từ + từ tiếng Trung gốc của giới từ
        const zhPhrase = [...nounPhraseZhTokens, currentZhWord].join('');
        newZhTokens.push(zhPhrase);

        i++; // Bỏ qua giới từ hiện tại
        processed = true;
      }
    }

    // Quy tắc 3: X 之处 (X/a 之处/n) -> Điểm X
    // Ví dụ: 优点/n 之处/n -> Điểm ưu điểm
    // zhTokens: ["优点", "之处"] -> "优点之处"
    // viTokensWithPos: ["ưu điểm|n", "chỗ|r"] -> "chỗ ưu điểm"
    if (
      currentPos === 'r' &&
      currentViWord === 'chỗ' && // Dịch từ '之处' thành 'chỗ'
      i > 0 &&
      ['n', 'a', 'v'].includes(viTokensWithPos[i - 1].split('|')[1])
    ) {
      const prevViTokenFull = viTokensWithPos[i - 1];
      const [prevViWord, prevViPos] = prevViTokenFull.split('|');
      const prevZhWord = zhTokens[i - 1]; // Từ tiếng Trung tương ứng với prevViWord
      const currentZhWordForZhiChu = zhTokens[i]; // Từ tiếng Trung tương ứng với 'chỗ' (là '之处')

      // Xóa từ tiếng Việt và tiếng Trung đã được thêm trước đó
      if (
        newViTokens.length > 0 &&
        newViTokens[newViTokens.length - 1].startsWith(prevViWord)
      ) {
        newViTokens.pop();
        newZhTokens.pop(); // Pop cả từ tiếng Trung tương ứng
      }

      // --- Tạo cụm tiếng Việt mới (ĐẢO THỨ TỰ) ---
      // "chỗ" + "từ đứng trước"
      const newViPhrase = 'chỗ' + ' ' + prevViWord + '|phrase';
      newViTokens.push(newViPhrase);

      // --- Tạo cụm tiếng Trung mới (KHÔNG ĐẢO THỨ TỰ) ---
      // từ tiếng Trung của 'từ đứng trước' + từ tiếng Trung của 'chỗ' ('之处')
      const newZhPhrase = prevZhWord + currentZhWordForZhiChu;
      newZhTokens.push(newZhPhrase);

      i++; // Bỏ qua '之处' (là 1 token tiếng Trung và 1 token tiếng Việt gốc)
      processed = true;
    }

    // Mặc định: Thêm từ trực tiếp nếu không có quy tắc đặc biệt nào áp dụng
    if (!processed) {
      newViTokens.push(currentViWord);
      newZhTokens.push(currentZhWord); // Đảm bảo thêm từ tiếng Trung tương ứng
      i++;
    }
  }

  return { zh: newZhTokens, vi: newViTokens };
}
