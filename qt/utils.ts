import { ReverseTrie, Trie } from './trie';

export function getZhViPairs1(
  text: string,
  trieNames: ReverseTrie,
  trieVietPhrase: ReverseTrie,
  chinesePhienAm: { [key: string]: string },
  personDict?: ReverseTrie,
): { zh: string; vi: string }[] {
  text = [...replaceSpecialChars(text)].reverse().join('');

  const tokens: { zh: string; vi: string }[] = [];
  let i = 0;

  while (i < text.length) {
    let match: [string, string | undefined];

    let nonChineseWord = '';

    // Detect non-Chinese sequences
    while (i < text.length && isAlphaNumeric(text[i])) {
      nonChineseWord = text[i] + nonChineseWord;
      i++;
    }

    // If a non-Chinese sequence is found, add it to tokens
    if (nonChineseWord) {
      tokens.push({ vi: nonChineseWord, zh: nonChineseWord });
      continue;
    }

    if (personDict) {
      // Check personal dictionary first
      match = personDict.findLongestSuffix(text.substring(i));
      if (match[0]) {
        tokens.push({ vi: match[1] || '', zh: match[0] });
        i += match[0].length;
        continue;
      }
    }

    // Check Names first
    // match = trieNames.findLongestSuffix(text.substring(i));
    // if (match[0]) {
    //   const nameParts = [];
    //   for (const char of match[0]) {
    //     const pinyin = chinesePhienAm[char] || ''; // Mặc định là chuỗi rỗng nếu không tìm thấy
    //     if (pinyin) {
    //       nameParts.push(pinyin.charAt(0).toUpperCase() + pinyin.slice(1));
    //     }
    //   }
    //   const name = nameParts.join(' ');
    //   tokens.push({ vi: name || '', zh: match[0] });
    //   i += match[0].length;
    //   continue;
    // }
    match = trieNames.findLongestSuffix(text.substring(i));
    if (match[0]) {
      tokens.push({ vi: match[1] || '', zh: match[0] });

      i += match[0].length;
      continue;
    }

    // Check VietPhrase
    match = trieVietPhrase.findLongestSuffix(text.substring(i));
    if (match[0]) {
      tokens.push({ vi: match[1] || '', zh: match[0] });
      i += match[0].length;
    } else {
      // Fallback to ChinesePhienAmWord
      const char = text[i];
      if (
        // char !== '的' &&
        // char !== '了' &&
        // char !== '著' &&
        // char !== '地' &&
        // char !== '地'
        1
      ) {
        const fallbackValue = chinesePhienAm[char] || char;
        tokens.push({
          // vi: fallbackValue.charAt(0).toUpperCase() + fallbackValue.slice(1),
          vi: fallbackValue,
          zh: char,
        });
      }
      i += 1;
    }
  }

  return tokens.reverse();
}

export function getZhViPairs(
  text: string,
  trieNames: ReverseTrie,
  trieVietPhrase: ReverseTrie,
  chinesePhienAm: { [key: string]: string },
  personDict: ReverseTrie | undefined,
): { zh: string; vi: string }[] {
  text = [...replaceSpecialChars(text)].reverse().join('');

  const tokens: { zh: string; vi: string }[] = [];
  let i = 0;

  while (i < text.length) {
    let match: [string, string | undefined];

    let nonChineseWord = '';

    // Detect non-Chinese sequences
    while (i < text.length && isAlphaNumeric(text[i])) {
      nonChineseWord += text[i];
      i++;
    }

    // If a non-Chinese sequence is found, add it to tokens
    if (nonChineseWord) {
      tokens.push({ vi: nonChineseWord, zh: nonChineseWord });
      continue;
    }

    if (personDict) {
      // Check personal dictionary first
      match = personDict.findLongestSuffix(text.substring(i));
      if (match[0]) {
        tokens.push({ vi: match[1] || '', zh: match[0] });
        i += match[0].length;
        continue;
      }
    }

    // Check Names first
    match = trieNames.findLongestSuffix(text.substring(i));
    if (match[0]) {
      tokens.push({ vi: match[1] + '|nr' || '', zh: match[0] });
      i += match[0].length;
      continue;
    }

    // Check VietPhrase
    match = trieVietPhrase.findLongestSuffix(text.substring(i));
    if (match[0]) {
      tokens.push({ vi: match[1] || '', zh: match[0] });
      i += match[0].length;
    } else {
      // Fallback to ChinesePhienAmWord
      const char = text[i];
      if (
        // char !== '的' &&
        // char !== '了' &&
        // char !== '著' &&
        // char !== '地' &&
        // char !== '地'
        1
      ) {
        const fallbackValue = chinesePhienAm[char] || char;
        tokens.push({ vi: fallbackValue, zh: char });
      }
      i += 1;
    }
  }

  return tokens.reverse();
}

function isAlphaNumeric(char: string): boolean {
  const regex = /^[a-zA-Z0-9]$/;
  return regex.test(char);
}

function isChineseCharacter(char: string) {
  const charCode = char.charCodeAt(0);
  return (charCode >= 0x4e00 && charCode <= 0x9fff) || char === '\n';
}

export function replaceSpecialChars(text: string): string {
  const SPECIAL_CHARS: { [key: string]: string } = {
    '。': '.',
    '，': ',',
    '、': ',',
    '；': ';',
    '！': '!',
    '？': '?',
    '：': ':',
    '（': '(',
    '）': ')',
    '〔': '“',
    '〕': '”',
    '【': '“',
    '】': '”',
    '｛': '{',
    '｝': '}',
    '『': '[',
    '』': ']',
    '～': '~',
    '〖': '“',
    '〗': '”',
    '〘': '“',
    '〙': ']',
    '〚': '“',
    '〛': '”',
    '　': ' ',
    '「': '“',
    '」': '”',
    ' ': '',
  };

  return Object.entries(SPECIAL_CHARS).reduce(
    (result, [han, viet]) => result.replace(new RegExp(han, 'g'), viet),
    text,
  );
}

export function translateZhToVi(
  text: string,
  trieNames: ReverseTrie,
  trieVietPhrase: ReverseTrie,
  chinesePhienAm: { [key: string]: string },
  hv: boolean = false,
): string {
  text = [...replaceSpecialChars(text)].reverse().join('');
  const tokens: string[] = [];
  let i = 0;

  while (i < text.length) {
    let match: [string, string | undefined];

    let nonChineseWord = '';

    // Detect non-Chinese sequences
    while (i < text.length && (isAlphaNumeric(text[i]) || text[i] == '/')) {
      nonChineseWord = text[i] + nonChineseWord;
      i++;
    }

    // If a non-Chinese sequence is found, add it to tokens
    if (nonChineseWord) {
      tokens.push(nonChineseWord);
      continue;
    }

    if (hv) {
      const value = chinesePhienAm[text[i]] || text[i];
      tokens.push(value);

      i++;
      continue;
    }

    match = trieNames.findLongestSuffix(text.substring(i));
    if (match[0]) {
      tokens.push(match[1]?.split('/')[0].split('|')[0] || '');
      i += match[0].length;
      continue;
    }

    match = trieVietPhrase.findLongestSuffix(text.substring(i));
    if (match[0]) {
      tokens.push(match[1]?.split('/')[0].split('|')[0] || '');
      i += match[0].length;
    } else {
      // Fallback to ChinesePhienAmWord
      const char = text[i];
      if (char !== '的' && char !== '了' && char !== '著' && char !== '地') {
        const fallbackValue = chinesePhienAm[char] || char;
        tokens.push(fallbackValue);
      }
      i += 1;
    }
  }

  return tokens.reverse().join(' ');
}

export function translateZhToVi2(
  text: string,
  trieNames: Trie,
  trieVietPhrase: Trie,
  chinesePhienAm: { [key: string]: string },
  hv: boolean = false,
): string {
  text = replaceSpecialChars(text);
  const tokens: string[] = [];
  let i = 0;

  while (i < text.length) {
    let match: [string, string | undefined];

    let nonChineseWord = '';

    // Detect non-Chinese sequences
    while (i < text.length && (isAlphaNumeric(text[i]) || text[i] == '/')) {
      nonChineseWord += text[i];
      i++;
    }

    // If a non-Chinese sequence is found, add it to tokens
    if (nonChineseWord) {
      tokens.push(nonChineseWord);
      continue;
    }

    if (hv) {
      const value = chinesePhienAm[text[i]] || text[i];
      tokens.push(value);

      i++;
      continue;
    }

    match = trieNames.findLongestPrefix(text.substring(i));
    if (match[0]) {
      tokens.push(match[1]?.split('/')[0] || '');
      i += match[0].length;
      continue;
    }

    match = trieVietPhrase.findLongestPrefix(text.substring(i));
    if (match[0]) {
      tokens.push(match[1]?.split('/')[0] || '');
      i += match[0].length;
    } else {
      // Fallback to ChinesePhienAmWord
      const char = text[i];
      if (char !== '的' && char !== '了' && char !== '著' && char !== '地') {
        const fallbackValue = chinesePhienAm[char] || char;
        tokens.push(fallbackValue);
      }
      i += 1;
    }
  }

  return tokens.join(' ');
}
