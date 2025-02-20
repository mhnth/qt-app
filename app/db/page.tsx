import { saveDictionaryDataInBatches } from '@/lib/firebase/firestore/addDict';
import { promises as fs } from 'fs';

interface DictionaryEntry {
  key: string;
  value: string;
}

export default async function Page() {
  // const data = await fs.readFile(process.cwd() + '/app/brief/info.txt', 'utf8');
  // const arr = data.split(/\s*\/\/\/\s*/);

  // const novels = await prisma.novel.findMany({
  //   orderBy: {
  //     id: 'asc',
  //   },
  // });
  // for (const novel of novels) {
  //   const brief = arr[novel.id - 1].replace(/(\r\n|\n|\r)/g, '\\n');
  //   // .replace(/^\\n|\\n+$/g, '');

  //   await prisma.novel.update({
  //     where: {
  //       id: novel.id,
  //     },
  //     data: {
  //       brief: brief,
  //     },
  //   });
  // }
  const readDictionaryFile = async (
    filePath: string
  ): Promise<DictionaryEntry[]> => {
    const fileContent = await fs.readFile(filePath, 'utf-8'); // Đọc file
    const lines = fileContent.split('\n'); // Tách các dòng
    const dictionaryData: DictionaryEntry[] = [];

    // Duyệt qua từng dòng và tách key-value
    lines.forEach((line) => {
      const [key, value] = line.split('='); // Tách theo dấu "="
      if (key && value) {
        dictionaryData.push({ key: key.trim(), value: value.trim() });
      }
    });

    return dictionaryData;
  };

  // Đọc dữ liệu từ file txt
  const filePath = 'D:/PersonalPJs/catnipzz.github.io/VP2.txt'; // Đường dẫn tới file txt
  const dictionaryData = await readDictionaryFile(filePath);

  // Lưu dữ liệu vào Firestore
  saveDictionaryDataInBatches(dictionaryData);

  console.log('done');

  // const data = await fs.readFile(
  //   process.cwd() + '/app/brief/user.json',
  //   'utf8',
  // );

  // const json = JSON.parse(data);

  // const userCount = await prisma.user.count();

  // for (const userData of json.slice(userCount)) {
  //   await prisma.user.create({
  //     data: {
  //       id: userData.id,
  //       email: userData.email,
  //       password: userData.password,
  //       username: userData.username,
  //     },
  //   });
  // }
  console.log('done user');
  return <div>ahoo</div>;
}
