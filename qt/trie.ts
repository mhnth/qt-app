export interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  value?: string;
}

export class Trie {
  root: TrieNode;
  wordCount: number;

  constructor() {
    this.root = { children: new Map(), isEndOfWord: false };
    this.wordCount = 0;
  }

  insert(word: string, value: string): void {
    let current = this.root;
    for (const char of word) {
      if (!current.children.has(char)) {
        current.children.set(char, { children: new Map(), isEndOfWord: false });
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.value = value;
    this.wordCount += 1;
  }

  batchInsert(words: [string, string][]): void {
    for (const [word, value] of words) {
      this.insert(word, value);
    }
  }

  count(): number {
    return this.wordCount;
  }

  findLongestPrefix(text: string): [string, string | undefined] {
    let current = this.root;
    let longestPrefix = '';
    let longestValue: string | undefined;
    let prefix = '';

    for (const char of text) {
      if (!current.children.has(char)) break;

      current = current.children.get(char)!;
      prefix += char;
      if (current.isEndOfWord) {
        longestPrefix = prefix;
        longestValue = current.value;
      }
    }

    return [longestPrefix, longestValue];
  }

  delete(word: string): boolean {
    const deleteHelper = (
      node: TrieNode,
      word: string,
      index: number
    ): boolean => {
      if (index === word.length) {
        // If we're at the end of the word, mark it as not an end of a word
        if (!node.isEndOfWord) {
          return false; // Word doesn't exist
        }
        node.isEndOfWord = false;
        this.wordCount -= 1;
        return node.children.size === 0; // If no children, we can delete this node
      }

      const char = word[index];
      const childNode = node.children.get(char);
      if (!childNode) {
        return false; // Word doesn't exist
      }

      const shouldDeleteChild = deleteHelper(childNode, word, index + 1);

      if (shouldDeleteChild) {
        // We don't delete the node if it's part of another word (has children)
        if (childNode.children.size === 0) {
          node.children.delete(char); // If the child has no children, remove it
        }
        return node.children.size === 0 && !node.isEndOfWord; // Can we delete the current node?
      }

      return false;
    };

    return deleteHelper(this.root, word, 0);
  }
}

export class ReverseTrie extends Trie {
  insert(word: string, value: string): void {
    let current = this.root;
    for (const char of [...word].reverse()) {
      if (!current.children.has(char)) {
        current.children.set(char, { children: new Map(), isEndOfWord: false });
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.value = value;
    this.wordCount += 1;
  }

  batchInsert(words: [string, string][]): void {
    for (const [word, value] of words) {
      this.insert(word, value);
    }
  }

  findLongestSuffix(text: string): [string, string | undefined] {
    let current = this.root;
    let longestSuffix = '';
    let longestValue: string | undefined;
    let suffix = '';

    for (const char of text) {
      if (!current.children.has(char)) break;

      current = current.children.get(char)!;
      suffix = char + suffix;
      if (current.isEndOfWord) {
        longestSuffix = suffix;
        longestValue = current.value;
      }
    }

    return [longestSuffix, longestValue];
  }
}
