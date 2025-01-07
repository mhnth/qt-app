import fs from 'fs';
// import epub from 'epub-gen';

// export async function createEpub(text: string) {
//   try {
//     const chapters = text.split('\n\n');
//     const content = chapters.map((chapter, index) => ({
//       title: `Chapter ${index + 1}`,
//       data: `<h1>Chapter ${index + 1}</h1><p>${chapter}</p>`,
//     }));

//     // Tùy chọn cho file EPUB
//     const options = {
//       title: 'Converted EPUB',
//       author: 'Your Name',
//       content: content,
//     };

//     const epubBuffer = await new epub(options).promise;

//     return Buffer.from(epubBuffer);
//   } catch (error) {}
// }

import epub from 'epub-gen';

export async function createEpub(text: string): Promise<Buffer> {
  try {
    const chapters = text.split('\n\n');
    const content = chapters.map((chapter, index) => ({
      title: `Chapter ${index + 1}`,
      data: `<h1>Chapter ${index + 1}</h1><p>${chapter}</p>`,
    }));

    const options = {
      title: 'Converted EPUB',
      author: 'Your Name',
      content: content,
    };

    // Tạo file EPUB và trả về buffer
    const epubPath = '/tmp/output.epub'; // Đường dẫn tạm thời
    await new epub(options).promise;

    // Đọc lại file từ path và trả về dưới dạng buffer
    const epubBuffer = fs.readFileSync(epubPath);

    return epubBuffer; // Trả về buffer
  } catch (error) {
    console.error('Error creating EPUB:', error);
    throw error; // Thêm lỗi nếu cần
  }
}
