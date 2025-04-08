import {
  DICT_URL,
  GITHUB_DICT_HOST,
  GITHUB_DICT_TOKEN,
} from '@/lib/server/env-server';

export async function GET() {
  try {
    // Danh sách các file cần fetch
    const fileNames = ['unused'];

    // Tạo một mảng các promises để fetch dữ liệu từ các file
    const fetchPromises = fileNames.map((fileName) =>
      fetch(`${DICT_URL}/${fileName}.txt`),
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
