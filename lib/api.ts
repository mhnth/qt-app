import { supabase } from '@/utils/supabase/client';

// export async function getAllWords() {
//   const { data, error } = await supabase.from('word').select('zh, vi'); // Chỉ lấy các cột zh và vi

//   if (error) {
//     console.error('Error fetching words:', error);
//     return null;
//   } else {
//     console.log('All words:', data);
//   }

//   return data;
// }

export async function getAllWords() {
  const PAGE_SIZE = 1000;
  let page = 0;
  let allWords: any[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('word')
      .select('zh, vi')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1); // Lấy từ trang hiện tại

    if (error) {
      console.error('Error fetching words:', error);
      break; // Dừng khi có lỗi
    }

    if (data.length === 0) {
      break; // Nếu không còn dữ liệu, dừng lại
    }

    allWords = [...allWords, ...data]; // Thêm dữ liệu vào danh sách
    page++; // Tiến đến trang tiếp theo
  }

  return allWords;

  console.log('All words:', allWords);
}

export const createWord = async (text: string, type: 'name' | 'vp') => {
  try {
    await fetch(`/api/dict/${type}`, {
      method: 'POST',
      body: JSON.stringify({ contents: text }),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const deleteWordDict = async (text: string) => {
  try {
    await fetch(`/api/dict`, {
      method: 'DELETE',
      body: JSON.stringify({ contents: text }),
    });
    return true;
  } catch (error) {
    return false;
  }
};
