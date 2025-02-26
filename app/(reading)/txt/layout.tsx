'use client';

import { ReaderSidebar } from '@/components/reader/sidebar';
import { Toolbar } from '@/components/reader/toolbar';
import { ReaderProvider } from '@/hooks/ui-context';
import { cx } from '@/lib/utils';
import { ReactNode, useState } from 'react';

export interface Novel {
  cover: string;
  title: string;
  author: string;
  link: string;
}

type Props = {
  children: ReactNode;
  chapterCount: number;
};

export default function ReadingLayout({ children, chapterCount }: Props) {
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
