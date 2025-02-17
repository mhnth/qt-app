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
  dot: boolean = false
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
      (_, p1, p2) => p1 + p2.toUpperCase()
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
      (_, p1, p2) => p1 + p2.toUpperCase()
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
    .replace(/(\n|\r\n|\r)/g, '\n\n'); // Thêm 2 lần xuống dòng sau mỗi đoạn
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
