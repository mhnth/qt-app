'use server';

import { createClient } from '@/utils/supabase/server';
import { unstable_cache } from 'next/cache';

export const getAllWords = unstable_cache(
  async () => {
    const supabase = await createClient();

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
  },
  [],
  { tags: ['dict'] }
);
