import {
  DICT_URL,
  GITHUB_DICT_HOST,
  GITHUB_DICT_TOKEN,
} from '@/lib/server/env-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Danh sách các file cần fetch
    // const fileNames = ['N', 'N2', 'VP', 'diff_NVP', 'vp_x', 'tudon'];
    const fileNames = ['jieba_dict', 'tudon', 'vp_x'];

    // Tạo một mảng các promises để fetch dữ liệu từ các file
    const fetchPromises = fileNames.map((fileName) =>
      fetch(`${DICT_URL}/origin/${fileName}.txt`),
    );

    // Chờ tất cả các promises hoàn thành
    const responses = await Promise.all(fetchPromises);

    // Kiểm tra xem tất cả các response có hợp lệ không
    if (responses.some((res) => !res.ok)) {
      throw new Error(
        'Failed to fetch one or more files from the third-party API',
      );
    }

    // Đọc nội dung của từng file và kết hợp chúng lại
    const textData = await Promise.all(responses.map((res) => res.text()));

    // Nối tất cả dữ liệu lại với nhau bằng dấu "\n"
    const combinedText = textData.join('\n');

    // Trả về response với nội dung là dữ liệu kết hợp
    return new Response(combinedText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.log('ERR fetch data vp:', error);

    return new Response('Error fetching data from dict', {
      status: 500,
    });
  }
}

// export async function GET() {
//   try {
//     const [res_1, res_2, res_x] = await Promise.all([
//       await fetch(`${DICT_URL}/vp.txt`),
//       await fetch(`${DICT_URL}/simple_word.txt`),
//       await fetch(`${DICT_URL}/vp_x.txt`),
//     ]);

//     if (!res_1.ok || !res_2.ok || !res_x) {
//       throw new Error('Failed to fetch data from the third-party API');
//     }

//     const textData =
//       (await res_1.text()) +
//       '\n' +
//       (await res_2.text()) +
//       '\n' +
//       (await res_x.text());

//     return new Response(textData, {
//       status: 200,
//       headers: {
//         'Content-Type': 'text/plain',
//       },
//     });
//   } catch (error) {
//     console.log('ERR fetch data vp:', error);

//     return new Response('Error fetching data from dict ', {
//       status: 500,
//     });
//   }
// }

export async function POST(req: NextRequest) {
  const { filename, contents } = await req.json();

  // const user = getSeverUser();

  // const fileName = user?.role === 'admin' ? filename : 'UserDict';

  const fileName = 'origin/vp_x.txt';

  try {
    await updateFileOnGitHub(fileName, `${contents}\n`);
  } catch (error) {
    console.log(error);
  }

  return NextResponse.json({});
}

async function getFileSHA(filename: string) {
  const response = await fetch(
    `${GITHUB_DICT_HOST}/${DICT_URL?.replace('https://', '')}/contents/${filename}`,
    {
      headers: {
        Authorization: `token ${GITHUB_DICT_TOKEN}`,
      },
    },
  );

  const data = await response.json();
  return data;
}

async function updateFileOnGitHub(filename: string, newContent: string) {
  // Get file info, includes content and SHA
  const fileInfo = await getFileSHA(filename);

  // decode current content from Base64
  // const currentContent = atob(fileInfo.content);
  const currentContent = Buffer.from(fileInfo.content, 'base64').toString(
    'utf-8',
  );

  // Add new content
  const updatedContent = currentContent + newContent;

  // encode new content Base64
  const encodedContent = Buffer.from(updatedContent, 'utf-8').toString(
    'base64',
  );

  // update on github
  const response = await fetch(
    `${GITHUB_DICT_HOST}/${DICT_URL?.replace('https://', '')}/contents/${filename}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_DICT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Appended new content to file',
        content: encodedContent,
        sha: fileInfo.sha,
        branch: 'main',
      }),
    },
  );

  const result = await response.json();
}
