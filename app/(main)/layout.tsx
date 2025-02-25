import type { Metadata } from 'next';

import Link from 'next/link';
import { IBook, ILanguage, IPlus, IUpload } from '@/components/icons';

export const metadata: Metadata = {
  title: 'QT app',
  description: '',
};

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <nav className="sticky top-0 w-full">
        <div className="mx-auto flex max-w-5xl items-center bg-slate-900/60 px-2 py-3 backdrop-blur-md md:px-6">
          <div className="flex items-center gap-2">
            <Link href={'/'}>Logo</Link>
            <Link
              className="ml-4 flex items-center gap-2 text-gray-200"
              href={'/txt'}
            >
              <IPlus className="w-4 fill-gray-200" />
              Txt
            </Link>
            <Link
              className="ml-4 flex items-center gap-2 text-gray-200"
              href={'/trans'}
            >
              <ILanguage className="w-4 fill-gray-200" />
              Dịch
            </Link>
            <Link
              className="ml-4 flex items-center gap-2 text-gray-200"
              href={'/dict'}
            >
              <IBook className="w-4 fill-gray-200" />
              Từ điển
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
