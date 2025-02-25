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
        <div className="max-w-5xl backdrop-blur-md px-2 md:px-6 py-3 bg-slate-900/40 flex mx-auto items-center">
          <div className="flex gap-2 items-center">
            <Link href={'/'}>Logo</Link>
            <Link
              className="ml-4 flex items-center gap-2 text-gray-200"
              href={'/txt'}
            >
              <IPlus className="fill-gray-200 w-4" />
              Txt
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
