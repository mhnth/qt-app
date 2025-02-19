'use client';

import {
  IBook,
  ICopy,
  IDelete,
  IDownload,
  ILanguage,
  IUpload,
} from '@/components/icons';
import { Reader } from '@/components/reader/reader';
import { splitIntoChunks } from '@/lib/utils';
import { useQT } from '@/qt/QTContext';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Virtuoso } from 'react-virtuoso';

export default function TranslatePage() {
  const { translateQT } = useQT();
  const [inputTxt, setInputTxt] = useState('');
  const [outputFileName, setOutputFileName] = useState('');
  const [textParts, setTextParts] = useState<string[]>([]);

  useEffect(() => {
    const savedInputTxt = sessionStorage.getItem('inputTxt');
    const savedOutputFileName = sessionStorage.getItem('outputFileName');
    if (savedInputTxt) setInputTxt(savedInputTxt);
    if (savedOutputFileName) setOutputFileName(savedOutputFileName);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('inputTxt', inputTxt);
    sessionStorage.setItem('outputFileName', outputFileName);

    const textChunks = splitIntoChunks(inputTxt);
    setTextParts(inputTxt ? textChunks || [] : []);
  }, [inputTxt, outputFileName]);

  const handleDel = () => {
    setInputTxt('');
    setOutputFileName('');
    setTextParts([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textParts.join('\n'));
    alert('✔️ Đã sao chép kết quả vào khay nhớ tạm');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setInputTxt(content.replace(/\r?\n/g, '\n'));
    };

    const fileName = file.name.replace('.txt', '');
    setOutputFileName(`${translateQT(fileName, false)}-${fileName}.txt`);
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const translatedText = translateQT(inputTxt, false);
    if (!translatedText) return alert('❌ tải xuống không thành công');

    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outputFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl p-2 text-white min-h-screen">
      <div
        className="mt-6 md:min-h-max min-h-[100vh] w-full rounded-md flex flex-col bg-neutral-800 
                   border px-6 pb-6 bg-opacity-60 shadow-md border-neutral-600"
      >
        <div className="h-max">
          <div className="mb-6 mt-2 flex gap-4 font-light">
            <Link className="flex gap-1 items-center" href={'/'}>
              <ILanguage className="w-4 h-4 fill-white" />
              Dịch
            </Link>
            <Link
              href={'/dict'}
              className="flex items-center gap-1 text-neutral-300"
            >
              <IBook className="w-3 h-4" />
              Từ điển cá nhân
            </Link>
          </div>
          <div className="flex justify-between">
            <label>Văn bản tiếng Trung</label>
            <div className="flex items-center gap-8 px-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <IUpload className="w-5 fill-neutral-300" />
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleUpload}
              />
              <button onClick={handleDel}>
                <IDelete className="w-5 fill-neutral-300" />
              </button>
              <button onClick={handleCopy}>
                <ICopy className="w-4 fill-neutral-300" />
              </button>
            </div>
          </div>

          <textarea
            className="mt-2 h-[50px] w-full rounded-sm border border-neutral-500 p-2 bg-neutral-900 bg-opacity-50"
            value={inputTxt}
            onChange={(e) => setInputTxt(e.target.value)}
          />
        </div>

        <div className="mt-3 rounded-md border px-4 border-neutral-600">
          <div className="md:h-max h-screen">
            <div className="flex justify-between items-center border-b border-neutral-600">
              <label>
                Kết quả dịch
                <span className="ml-2 font-light underline">
                  {outputFileName}
                </span>
              </label>
              <div className="flex gap-8">
                <button onClick={handleCopy}>
                  <ICopy className="w-4 fill-neutral-300" />
                </button>
                <button onClick={handleDownload}>
                  <IDownload className="w-5 fill-neutral-300" />
                </button>
              </div>
            </div>
            <div className="md:h-[600px] mt-4 h-[calc(100vh-37px)]">
              {/* <Virtuoso
                id="virtuoso-scroller"
                style={{ height: '600px' }}
                totalCount={textParts.length}
                itemContent={(index) => (
                  <div
                    style={{ padding: '10px', borderBottom: '1px solid gray' }}
                  >
                    <Reader rawText={textParts[index]} />
                  </div>
                )}
                increaseViewportBy={300} // Load trước 300px mỗi phía
              /> */}
              <Virtuoso
                id="virtuoso-container"
                style={{ height: '600px' }}
                totalCount={textParts.length}
                itemContent={(index) => (
                  <div
                    className="virtuoso-scroller" // Đảm bảo phần tử container có class này
                    style={{ padding: '10px', borderBottom: '1px solid gray' }}
                  >
                    <Reader rawText={textParts[index]} />
                  </div>
                )}
                increaseViewportBy={300}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import {
//   IBook,
//   ICopy,
//   IDelete,
//   IDownload,
//   ILanguage,
//   IUpload,
// } from '@/components/icons';
// import { Reader } from '@/components/reader/reader';
// import { splitIntoChunks } from '@/lib/utils';
// import { useQT } from '@/qt/QTContext';
// import Link from 'next/link';
// import { useEffect, useRef, useState } from 'react';
// import { VariableSizeList as List } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';

// export default function TranslatePage() {
//   const { translateQT } = useQT();
//   const [inputTxt, setInputTxt] = useState('');
//   const [outputFileName, setOutputFileName] = useState('');
//   const [textParts, setTextParts] = useState<string[]>([]);

//   useEffect(() => {
//     const savedInputTxt = sessionStorage.getItem('inputTxt');
//     const savedOutputFileName = sessionStorage.getItem('outputFileName');
//     if (savedInputTxt) setInputTxt(savedInputTxt);
//     if (savedOutputFileName) setOutputFileName(savedOutputFileName);
//   }, []);

//   useEffect(() => {
//     sessionStorage.setItem('inputTxt', inputTxt);
//     sessionStorage.setItem('outputFileName', outputFileName);

//     const textChunks = splitIntoChunks(inputTxt);
//     // setTextParts(inputTxt ? inputTxt.match(/.{1,10000}/g) || [] : []);

//     setTextParts(inputTxt ? textChunks || [] : []);
//   }, [inputTxt, outputFileName]);

//   const handleDel = () => {
//     setInputTxt('');
//     setOutputFileName('');
//     setTextParts([]);
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(textParts.join('\n'));
//     alert('✔️ Đã sao chép kết quả vào khay nhớ tạm');
//   };

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = () => {
//       const content = reader.result as string;
//       setInputTxt(content.replace(/\r?\n/g, '\n'));
//     };

//     const fileName = file.name.replace('.txt', '');
//     setOutputFileName(`${translateQT(fileName, false)}-${fileName}.txt`);
//     reader.readAsText(file);
//   };

//   const handleDownload = () => {
//     const translatedText = translateQT(inputTxt, false);
//     if (!translatedText) return alert('❌ tải xuống không thành công');

//     const blob = new Blob([translatedText], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = outputFileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const Row = ({ index, style }: { index: number; style: any }) => (
//     <div style={{ ...style, padding: '10px', whiteSpace: 'pre-wrap' }}>
//       <Reader rawText={textParts[index]} />
//     </div>
//   );
//   return (
//     <div className="mx-auto max-w-5xl p-2 text-white min-h-screen">
//       <div
//         className="mt-6 md:min-h-max min-h-[100vh] w-full rounded-md flex flex-col bg-neutral-800
//                    border px-6 pb-6 bg-opacity-60 shadow-md border-neutral-600"
//       >
//         <div className="h-max">
//           <div className="mb-6 mt-2 flex gap-4 font-light">
//             <Link className="flex gap-1 items-center" href={'/'}>
//               <ILanguage className="w-4 h-4 fill-white" />
//               Dịch
//             </Link>
//             <Link
//               href={'/dict'}
//               className="flex items-center gap-1 text-neutral-300"
//             >
//               <IBook className="w-3 h-4" />
//               Từ điển cá nhân
//             </Link>
//           </div>
//           <div className="flex justify-between">
//             <label>Văn bản tiếng Trung</label>
//             <div className="flex items-center gap-8 px-4">
//               <label htmlFor="file-upload" className="cursor-pointer">
//                 <IUpload className="w-5 fill-neutral-300" />
//               </label>
//               <input
//                 id="file-upload"
//                 type="file"
//                 accept=".txt"
//                 className="hidden"
//                 onChange={handleUpload}
//               />
//               <button onClick={handleDel}>
//                 <IDelete className="w-5 fill-neutral-300" />
//               </button>
//               <button onClick={handleCopy}>
//                 <ICopy className="w-4 fill-neutral-300" />
//               </button>
//             </div>
//           </div>

//           <textarea
//             className="mt-2 h-[50px] w-full rounded-sm border border-neutral-500 p-2 bg-neutral-900 bg-opacity-50"
//             value={inputTxt}
//             onChange={(e) => setInputTxt(e.target.value)}
//           />
//         </div>

//         <div className="mt-3 rounded-md border px-4 border-neutral-600">
//           <div className="md:h-max h-screen">
//             <div className="flex justify-between items-center border-b border-neutral-600">
//               <label>
//                 Kết quả dịch
//                 <span className="ml-2 font-light underline">
//                   {outputFileName}
//                 </span>
//               </label>
//               <div className="flex gap-8">
//                 <button onClick={handleCopy}>
//                   <ICopy className="w-4 fill-neutral-300" />
//                 </button>
//                 <button onClick={handleDownload}>
//                   <IDownload className="w-5 fill-neutral-300" />
//                 </button>
//               </div>
//             </div>
//             <div className="md:h-[600px] mt-4 h-[calc(100vh-37px)] text-justify">
//               <AutoSizer>
//                 {({ height, width }) => (
//                   <List
//                     height={height}
//                     width={width}
//                     // itemSize={(index) =>
//                     //   (textParts[index].length / 50) * 20 + 50
//                     // }
//                     itemSize={(index) =>
//                       Math.min((textParts[index]?.length / 50) * 20 + 50, 300)
//                     }
//                     itemCount={textParts.length}
//                     // className=''
//                   >
//                     {Row}
//                   </List>
//                 )}
//               </AutoSizer>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
