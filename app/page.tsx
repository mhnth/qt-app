'use client';

import d from '@/lib/doublearray.js';
import { useQT } from '@/qt/QTContext';
import { useEffect } from 'react';

export default function About() {
  // var words = [
  //   { k: 'a', v: 1 },
  //   { k: 'abc', v: 2 },
  //   { k: '奈良', v: 3 },
  //   { k: '奈良先端', v: 4 },
  //   { k: '奈良先端科学技術大学院大学', v: 5 },
  // ];

  // var trie = d.builder().build(words, true);

  // const results = trie.commonPrefixSearch('奈良先端科学技術');

  // console.log('hello', trie, 'r:', results);

  return <div>About</div>;
}
