'use client';

import {
  formatTxt,
  getItemLocalStorage,
  setItemLocalStorage,
} from '@/lib/utils';
import { hanviet } from './hanviet';
import { ReverseTrie, Trie } from './trie';
import { clearDB } from './useIndexedDB';
import { getZhViPairs, translateZhToVi } from './utils';

const PERSON_DICT_KEY = 'person_dict';
const UNUSED_PERSON_DICT = 'unused_person_dict';

export class QTManager {
  public loading: boolean = false;
  private trieNames: Trie | undefined;
  private trieVietPhrase: Trie | undefined;
  private chinesePhienAm: any;
  private personalDict: Trie | undefined;

  constructor(
    private saveData: (
      fileName: string,
      entries: [string, string][],
    ) => Promise<void>,
    private loadData: (fileName: string) => Promise<[string, string][]>,
  ) {
    this.chinesePhienAm = hanviet; // Default value
  }

  async loadFile(fileName: 'name' | 'vp', trie: Trie) {
    let entries: [string, string][] = (await this.loadData(fileName)) || [];
    let unusedWords: string[] = [];

    let data = '';
    let unusedData = '';

    if (entries.length === 0) {
      try {
        const [res, unusedRes] = await Promise.all([
          await fetch(`/api/dict/${fileName}`, {
            cache: 'no-store',
          }),
          await fetch(`/api/dict/unused`, {
            cache: 'no-cache',
          }),
        ]);

        data = await res.text();
        unusedData = await unusedRes.text();

        entries = data
          .split('\n')
          .map((line) => {
            const [key, value] = line.trim().split('=');
            return key && value ? [key, value] : null;
          })
          .filter((entry) => entry !== null) as [string, string][];

        unusedWords = unusedData.split('\n').map((line) => {
          const [key, value] = line.trim().split('=');
          return key && value ? key : '';
        });

        await this.saveData(fileName, entries);
        console.log(
          `Loaded and cached ${entries.length} entries from ${fileName}`,
        );
      } catch (err) {
        console.warn(`${fileName} not found. Proceeding without data.`);
      }
    }

    trie.batchInsert(entries);
    trie.batchDelete(unusedWords);
  }

  // Get and translate pairs
  getQTPairs(rawText: string) {
    if (!this.loading && this.trieNames && this.trieVietPhrase) {
      const tokens = getZhViPairs(
        rawText,
        this.trieNames,
        this.trieVietPhrase,
        this.chinesePhienAm,
        this.personalDict,
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
        hv,
      );

      return formatTxt(tokens);
    }
  }

  addToPersonalDictionary({ zh, vi }: { zh: string; vi: string }) {
    const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

    const updatedDictData = existingDictData.filter(
      ([key]: [string]) => key !== zh,
    );

    updatedDictData.push([zh, vi]);

    setItemLocalStorage(PERSON_DICT_KEY, updatedDictData);

    const newPersonDictionary = new Trie();
    newPersonDictionary.batchInsert(updatedDictData);
    this.personalDict = newPersonDictionary;
  }

  updatePersonalDictionary(newDict: [string, string][]) {
    setItemLocalStorage(PERSON_DICT_KEY, newDict);

    const newPersonDictionary = new Trie();
    newPersonDictionary.batchInsert(newDict);
    this.personalDict = newPersonDictionary;
  }

  getPersonalDictionary(): [zh: string, vi: string][] {
    const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

    return existingDictData || [];
  }

  async loadDictionary() {
    this.loading = true;

    // load local person dictionary
    const personDictData = getItemLocalStorage(PERSON_DICT_KEY);
    const unusedPersonDictData = getItemLocalStorage(UNUSED_PERSON_DICT);

    const personDict = new Trie();
    if (personDictData) {
      personDict.batchInsert(personDictData);
      this.personalDict = personDict;
    }

    [this.trieNames, this.trieVietPhrase] = [new Trie(), new Trie()];

    await Promise.all([
      this.loadFile('name', this.trieNames),
      this.loadFile('vp', this.trieVietPhrase),
    ]);

    this.trieNames.batchDelete(unusedPersonDictData);
    this.trieVietPhrase.batchDelete(unusedPersonDictData);
    this.loading = false;
  }

  async revalidate() {
    this.loading = true;
    await clearDB();

    this.trieNames = new Trie();
    this.trieVietPhrase = new Trie();
    this.personalDict = new Trie();

    await this.loadDictionary();
    this.loading = false;
  }

  deleteWord(word: string) {
    this.trieVietPhrase?.delete(word);

    let unusedPersonDict = getItemLocalStorage(UNUSED_PERSON_DICT) || [];

    let unusedSet = new Set(unusedPersonDict);

    unusedSet.add(word);

    setItemLocalStorage(UNUSED_PERSON_DICT, [...unusedSet]);

    const isExistInLocalDict = this.personalDict?.delete(word);

    if (isExistInLocalDict) {
      const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

      const updatedDictData = existingDictData.filter(
        ([key]: [string]) => key !== word,
      );

      setItemLocalStorage(PERSON_DICT_KEY, updatedDictData);

      const newPersonDictionary = new Trie();
      newPersonDictionary.batchInsert(updatedDictData);
      this.personalDict = newPersonDictionary;
    }
  }
}

export class QTManager1 {
  public loading: boolean = false;
  private trieNames: ReverseTrie | undefined;
  private trieVietPhrase: ReverseTrie | undefined;
  private chinesePhienAm: any;
  private personalDict: ReverseTrie | undefined;

  constructor(
    private saveData: (
      fileName: string,
      entries: [string, string][],
    ) => Promise<void>,
    private loadData: (fileName: string) => Promise<[string, string][]>,
  ) {
    this.chinesePhienAm = hanviet; // Default value
  }

  async loadFile(fileName: 'name' | 'vp', trie: ReverseTrie) {
    let entries: [string, string][] = (await this.loadData(fileName)) || [];
    let unusedWords: string[] = [];

    let data = '';
    let unusedData = '';

    if (entries.length === 0) {
      try {
        const [res, unusedRes] = await Promise.all([
          await fetch(`/api/dict/${fileName}`, {
            cache: 'no-store',
          }),
          await fetch(`/api/dict/unused`, {
            cache: 'no-cache',
          }),
        ]);

        data = await res.text();
        unusedData = await unusedRes.text();

        entries = data
          .split('\n')
          .map((line) => {
            const [key, value] = line.trim().split('=');
            return key && value ? [key, value] : null;
          })
          .filter((entry) => entry !== null) as [string, string][];

        unusedWords = unusedData.split('\n').map((line) => {
          const [key, value] = line.trim().split('=');
          return key && value ? key : '';
        });

        await this.saveData(fileName, entries);
        console.log(
          `Loaded and cached ${entries.length} entries from ${fileName}`,
        );
      } catch (err) {
        console.warn(`${fileName} not found. Proceeding without data.`);
      }
    }

    trie.batchInsert(entries);
    trie.batchDelete(unusedWords);
  }

  // Get and translate pairs
  getQTPairs(rawText: string) {
    if (!this.loading && this.trieNames && this.trieVietPhrase) {
      const tokens = getZhViPairs(
        rawText,
        this.trieNames,
        this.trieVietPhrase,
        this.chinesePhienAm,
        this.personalDict,
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
        hv,
      );

      return formatTxt(tokens);
    }
  }

  addToPersonalDictionary({ zh, vi }: { zh: string; vi: string }) {
    const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

    const updatedDictData = existingDictData.filter(
      ([key]: [string]) => key !== zh,
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

    // load local person dictionary
    const personDictData = getItemLocalStorage(PERSON_DICT_KEY);
    const unusedPersonDictData = getItemLocalStorage(UNUSED_PERSON_DICT);

    const personDict = new ReverseTrie();
    if (personDictData) {
      personDict.batchInsert(personDictData);
      this.personalDict = personDict;
    }

    [this.trieNames, this.trieVietPhrase] = [
      new ReverseTrie(),
      new ReverseTrie(),
    ];

    await Promise.all([
      this.loadFile('name', this.trieNames),
      this.loadFile('vp', this.trieVietPhrase),
    ]);

    this.trieNames.batchDelete(unusedPersonDictData);
    this.trieVietPhrase.batchDelete(unusedPersonDictData);
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

    let unusedPersonDict = getItemLocalStorage(UNUSED_PERSON_DICT) || [];

    let unusedSet = new Set(unusedPersonDict);

    unusedSet.add(word);

    setItemLocalStorage(UNUSED_PERSON_DICT, [...unusedSet]);

    const isExistInLocalDict = this.personalDict?.delete(word);

    if (isExistInLocalDict) {
      const existingDictData = getItemLocalStorage(PERSON_DICT_KEY) || [];

      const updatedDictData = existingDictData.filter(
        ([key]: [string]) => key !== word,
      );

      setItemLocalStorage(PERSON_DICT_KEY, updatedDictData);

      const newPersonDictionary = new ReverseTrie();
      newPersonDictionary.batchInsert(updatedDictData);
      this.personalDict = newPersonDictionary;
    }
  }
}
