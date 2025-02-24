import { saveDictionaryDataInBatches } from '@/lib/firebase/firestore/addDict';
import { supabase } from '@/utils/supabase/client';
import { promises as fs } from 'fs';

interface DictionaryEntry {
  key: string;
  value: string;
}

export default async function Page() {
  // const readDictionaryFile = async (
  //   filePath: string
  // ): Promise<DictionaryEntry[]> => {
  //   const fileContent = await fs.readFile(filePath, 'utf-8'); // Đọc file
  //   const lines = fileContent.split('\n'); // Tách các dòng
  //   const dictionaryData: DictionaryEntry[] = [];

  //   // Duyệt qua từng dòng và tách key-value
  //   lines.forEach((line) => {
  //     const [key, value] = line.split('='); // Tách theo dấu "="
  //     if (key && value) {
  //       dictionaryData.push({ key: key.trim(), value: value.trim() });
  //     }
  //   });

  //   return dictionaryData;
  // };

  // Đọc dữ liệu từ file txt
  const filePath = 'D:/PersonalPJs/catnipzz.github.io/VP.txt'; // Đường dẫn tới file txt

  const data = await fs.readFile(filePath, 'utf8');

  // Tách dữ liệu thành các dòng
  const lines = data.split('\n');

  // Duyệt qua từng dòng và xử lý
  for (const line of lines) {
    // Bỏ qua các dòng trống hoặc không có dấu '='
    if (!line.includes('=')) continue;

    const [zh, vi] = line.split('=').map((item) => item.trim());

    // Thêm dữ liệu vào bảng `words`
    const { error: wordError } = await supabase
      .from('word')
      .insert([{ zh, vi }]);

    if (wordError) {
      console.error('Error inserting word:', wordError);
      continue; // Tiếp tục với từ tiếp theo nếu có lỗi
    }
  }

  console.log('done user');
  return <div>ahoo</div>;
}
