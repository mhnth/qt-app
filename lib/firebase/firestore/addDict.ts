import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import firebase_app from '../config';

// Get the Firestore instance
const db = getFirestore(firebase_app);

interface DictionaryEntry {
  key: string;
  value: string;
}

export const saveDictionaryDataInBatches = async (data: DictionaryEntry[]) => {
  const batchSize = 500; // Max batch size for Firestore
  let batch = writeBatch(db); // Tạo một batch mới từ writeBatch
  let count = 0;

  try {
    for (let i = 0; i < data.length; i++) {
      const { key, value } = data[i];
      const docRef = doc(db, 'dictionary', key); // Tạo docRef từ doc()

      // Thêm thao tác ghi vào batch
      batch.set(docRef, { value });

      count++;

      // Nếu batch đạt tối đa 500 thao tác, commit và tạo batch mới
      if (count === batchSize) {
        await batch.commit();
        console.log(`Batch ${Math.floor(i / batchSize) + 1} committed`);
        batch = writeBatch(db); // Tạo batch mới
        count = 0;
      }
    }

    // Commit batch cuối cùng nếu còn dữ liệu
    if (count > 0) {
      await batch.commit();
      console.log(`Final batch committed`);
    }

    console.log('All data saved successfully!');
  } catch (error) {
    console.error('Error saving data in batches: ', error);
  }
};

// Ví dụ dữ liệu từ điển
const dictionaryData: DictionaryEntry[] = [
  { key: '正屋门', value: 'cửa chính' },
  { key: '拐了拐', value: 'ngoặt một chút' },
  { key: '略说了', value: 'nói sơ qua' },
  { key: '皇城里', value: 'trong hoàng thành' },
  // Thêm vào dữ liệu cần thiết ở đây...
];

// Lưu dữ liệu
saveDictionaryDataInBatches(dictionaryData);
