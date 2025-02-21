import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QTProvider } from '@/qt/QTContext';
import Link from 'next/link';
import { IBook, ILanguage, IUpload } from '@/components/icons';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QT app',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`text-base bg-[url(https://images.unsplash.com/photo-1486707471592-8e7eb7e36f78?q=80&w=1994&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] bg-cover h-max`}
      >
        <QTProvider>
          <main>{children}</main>
          <div className="fixed bottom-0 h-12 bg-black/55 w-full flex justify-center items-center">
            <div className="w-max max-w-md text-xs flex justify-between space-x-16 px-8">
              <Link className="flex items-center flex-col" href={'/trans'}>
                <ILanguage className="fill-white h-5" />
                Dịch
              </Link>
              <Link className="flex items-center flex-col" href={'/txt'}>
                <IUpload className="fill-white h-5" />
                Txt
              </Link>
              <Link className="flex items-center flex-col" href={'/dict'}>
                <IBook className="fill-white h-5" />
                Dict
              </Link>
            </div>
          </div>
        </QTProvider>
      </body>
    </html>
  );
}
