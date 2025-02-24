import { promises as fs } from 'fs';
import { supabase } from '@/utils/supabase/client';

interface DictionaryEntry {
  zh: string;
  vi: string;
}

export default async function Page() {
  const filePath = 'D:/PersonalPJs/catnipzz.github.io/VP.txt'; // Đường dẫn tới file txt

  const data = await fs.readFile(filePath, 'utf8');
  const lines = data.split('\n');

  const dictionaryData: DictionaryEntry[] = [];

  // Duyệt qua từng dòng và tách key-value
  lines.forEach((line) => {
    if (!line.includes('=')) return; // Bỏ qua các dòng không hợp lệ

    const [zh, vi] = line.split('=').map((item) => item.trim());
    if (zh && vi) {
      dictionaryData.push({ zh, vi });
    }
  });

  // Chia dữ liệu thành các batch nhỏ (ví dụ mỗi batch 1000 entries)
  const BATCH_SIZE = 699;
  for (let i = 0; i < dictionaryData.length; i += BATCH_SIZE) {
    const batch = dictionaryData.slice(i, i + BATCH_SIZE);

    // Chèn dữ liệu vào bảng `words` trong mỗi batch, bỏ qua nếu từ `zh` đã tồn tại
    const { data: insertedData, error: batchError } = await supabase
      .from('word')
      .upsert(batch); // Chỉ xét cột 'zh' khi kiểm tra sự trùng lặp

    if (batchError) {
      console.error('Error inserting batch:', batchError);
      continue; // Tiếp tục với batch tiếp theo nếu có lỗi
    } else {
      // console.log(`Batch ${i / BATCH_SIZE + 1} inserted successfully.`);
    }
  }

  console.log('Done user');
  return <div>ahoo</div>;
}
