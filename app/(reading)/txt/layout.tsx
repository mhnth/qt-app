'use client';

import { ReaderSidebar } from '@/components/reader/sidebar';
import { Toolbar } from '@/components/reader/toolbar';
import { ReaderProvider } from '@/hooks/ui-context';

export interface Novel {
  cover: string;
  title: string;
  author: string;
  link: string;
}

export default function ReadingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ReaderProvider>
        {children}
        <Toolbar />
        <ReaderSidebar />
      </ReaderProvider>
    </>
  );
}
