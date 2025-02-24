'use client';

import {
  formatTxt,
  getItemLocalStorage,
  setItemLocalStorage,
} from '@/lib/utils';
import { hanviet } from './hanviet';
import { ReverseTrie } from './trie';
import { clearDB } from './useIndexedDB';
import { getZhViPairs, translateZhToVi } from './utils';

const PERSON_DICT_KEY = 'person_dict';

export class QTManager {
  public loading: boolean = false;
  private trieNames: ReverseTrie | undefined;
  private trieVietPhrase: ReverseTrie | undefined;
  private chinesePhienAm: any;
  private personalDict: ReverseTrie | undefined;

  constructor(
    private saveData: (
      fileName: string,
      entries: [string, string][]
    ) => Promise<void>,
    private loadData: (fileName: string) => Promise<[string, string][]>
  ) {
    this.chinesePhienAm = hanviet; // Default value
  }

  async loadFile(fileName: 'Names' | 'VietPhrase', trie: ReverseTrie) {
    let entries: [string, string][] = (await this.loadData(fileName)) || [];

    let data = '';

    if (entries.length === 0) {
      console.log('load new dick');

      fetch('/api/dict');

      try {
        const [fileName1, fileName2] =
          fileName === 'Names' ? ['Names', 'Names2'] : ['VietPhrase', 'VP2'];

        if (fileName === 'Names') {
          const [res1, res2] = await Promise.all([
            await fetch(`https://catnipzz.github.io/${fileName1}.txt`, {
              cache: 'no-store',
            }),
            await fetch(`https://catnipzz.github.io/${fileName2}.txt`, {
              cache: 'no-store',
            }),
          ]);

          const [data1, data2] = await Promise.all([
            await res1.text(),
            await res2.text(),
          ]);

          data = data1 + '\n' + data2;
        } else {
          const [
            res1,
            res2,
            //  res3, res4, res5
          ] = await Promise.all([
            await fetch(`https://catnipzz.github.io/VP1.txt`, {
              cache: 'no-store',
            }),
            await fetch(`https://catnipzz.github.io/VP10.txt`, {
              cache: 'no-store',
            }),
            // await fetch(`https://catnipzz.github.io/VP3.txt`, {
            //   cache: 'no-store',
            // }),
            // await fetch(`https://catnipzz.github.io/VP4.txt`, {
            //   cache: 'no-store',
            // }),
            // await fetch(`https://catnipzz.github.io/VP5.txt`, {
            //   cache: 'no-store',
            // }),
          ]);

          const [
            data1,
            data2,
            // data3, data4, data5
          ] = await Promise.all([
            await res1.text(),
            await res2.text(),
            // await res3.text(),
            // await res4.text(),
            // await res5.text(),
          ]);

          data = data1 + '\n' + data2 + '\n';
          // + data3 + '\n' + data4 + '\n' + data5;
        }

        // const [res1, res2] = await Promise.all([
        //   await fetch(`https://catnipzz.github.io/${fileName1}.txt`, {
        //     cache: 'no-store',
        //   }),
        //   await fetch(`https://catnipzz.github.io/${fileName2}.txt`, {
        //     cache: 'no-store',
        //   }),
        // ]);

        // const [data1, data2] = await Promise.all([
        //   await res1.text(),
        //   await res2.text(),
        // ]);

        // data = data1 + '\n' + data2;

        entries = data
          .split('\n')
          .map((line) => {
            const [key, value] = line.trim().split('=');
            return key && value ? [key, value] : null;
          })
          .filter((entry) => entry !== null) as [string, string][];

        await this.saveData(fileName, entries);
        console.log(
          `Loaded and cached ${entries.length} entries from ${fileName}`
        );

        // return entries;
      } catch (err) {
        console.warn(`${fileName} not found. Proceeding without data.`);
      }
    }

    trie.batchInsert(entries);
  }

  // Get and translate pairs
  getQTPairs(rawText: string) {
    if (!this.loading && this.trieNames && this.trieVietPhrase) {
      const tokens = getZhViPairs(
        rawText,
        this.trieNames,
        this.trieVietPhrase,
        this.chinesePhienAm,
        this.personalDict
      );

      return {
        viArr: tokens.map((token) => token.vi),
        zhArr: tokens.map((token) => token.zh),
      };
    }
  }

  translateQT(rawText: string, hv: boolean = false) {
    if (this.trieNames && this.trieVietPhrase) {
      const tokens = translateZhToVi(
        rawText,
        this.trieNames,
        this.trieVietPhrase,
        this.chinesePhienAm,
        hv
      );

      return formatTxt(tokens);
    }
  }

  addToPersonalDictionary({ zh, vi }: { zh: string; vi: string }) {
    const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

    const updatedDictData = existingDictData.filter(
      ([key]: [string]) => key !== zh
    );

    updatedDictData.push([zh, vi]);

    setItemLocalStorage(PERSON_DICT_KEY, updatedDictData);

    const newPersonDictionary = new ReverseTrie();
    newPersonDictionary.batchInsert(updatedDictData);
    this.personalDict = newPersonDictionary;
  }

  updatePersonalDictionary(newDict: [string, string][]) {
    setItemLocalStorage(PERSON_DICT_KEY, newDict);

    const newPersonDictionary = new ReverseTrie();
    newPersonDictionary.batchInsert(newDict);
    this.personalDict = newPersonDictionary;
  }

  getPersonalDictionary(): [zh: string, vi: string][] {
    const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

    return existingDictData || [];
  }

  async loadDictionary() {
    this.loading = true;
    // load person dictionary
    const personDictData = getItemLocalStorage(PERSON_DICT_KEY);

    const personDict = new ReverseTrie();
    if (personDictData) {
      personDict.batchInsert(personDictData);
      this.personalDict = personDict;
    }

    // const [names, vietPhrase] = [new ReverseTrie(), new ReverseTrie()];

    [this.trieNames, this.trieVietPhrase] = [
      new ReverseTrie(),
      new ReverseTrie(),
    ];

    await Promise.all([
      this.loadFile('Names', this.trieNames),
      this.loadFile('VietPhrase', this.trieVietPhrase),
    ]);

    // this.trieNames = names;
    // this.trieVietPhrase = vietPhrase;

    this.loading = false;
  }

  async revalidate() {
    this.loading = true;
    await clearDB();

    this.trieNames = new ReverseTrie();
    this.trieVietPhrase = new ReverseTrie();
    this.personalDict = new ReverseTrie();

    await this.loadDictionary();
    this.loading = false;
  }

  deleteWord(word: string) {
    word = [...word].reverse().join('');
    this.trieVietPhrase?.delete(word);

    const isExistInLocalDict = this.personalDict?.delete(word);

    if (isExistInLocalDict) {
      // delete word in localStorage
      const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

      const updatedDictData = existingDictData.filter(
        ([key]: [string]) => key !== word
      );

      setItemLocalStorage(PERSON_DICT_KEY, updatedDictData);

      const newPersonDictionary = new ReverseTrie();
      newPersonDictionary.batchInsert(updatedDictData);
      this.personalDict = newPersonDictionary;
    }
  }
}
