'use client';

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from 'react';

type Theme = 'White' | 'Grey' | 'Dark' | 'Blue' | 'Yellow';
type FontSize = 'small' | 'base' | 'large';
type SidebarType = 'toc' | 'settings' | null;

interface ReaderPreferences {
  theme: Theme;
  fontSize: FontSize;
  sidebar: SidebarType;
  currentChapter: number | null;
  chapterList: string[] | null;
}

type ReaderAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_FONT_SIZE'; payload: FontSize }
  | { type: 'SET_SIDEBAR'; payload: SidebarType }
  | { type: 'SET_CHAPTER'; payload: number | null }
  | { type: 'SET_CHAPTER_LIST'; payload: string[] | null }
  | { type: 'LOAD_PREFERENCES'; payload: Partial<ReaderPreferences> };

const defaultPreferences: ReaderPreferences = {
  theme: 'White',
  fontSize: 'base',
  sidebar: null,
  currentChapter: null,
  chapterList: null,
};

const ReaderContext = createContext<
  | {
      preferences: ReaderPreferences;
      setTheme: (theme: Theme) => void;
      setFontSize: (fs: FontSize) => void;
      setSidebar: (type: SidebarType) => void;
      setCurrentChapter: (chapter: number | null) => void;
      setChapterList: (chapterList: string[] | null) => void;
    }
  | undefined
>(undefined);

const readerReducer = (state: ReaderPreferences, action: ReaderAction) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'SET_SIDEBAR':
      return { ...state, sidebar: action.payload };
    case 'SET_CHAPTER':
      return { ...state, currentChapter: action.payload };
    case 'SET_CHAPTER_LIST':
      return { ...state, chapterList: action.payload };
    case 'LOAD_PREFERENCES':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

interface ProviderProps {
  children: ReactNode;
}

export const ReaderProvider: FC<ProviderProps> = ({ children }) => {
  const [preferences, dispatch] = useReducer(readerReducer, defaultPreferences);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPrefs = localStorage.getItem('reader_preferences');
      if (storedPrefs) {
        dispatch({
          type: 'LOAD_PREFERENCES',
          payload: JSON.parse(storedPrefs),
        });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reader_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const setTheme = (theme: Theme) =>
    dispatch({ type: 'SET_THEME', payload: theme });
  const setFontSize = (fs: FontSize) =>
    dispatch({ type: 'SET_FONT_SIZE', payload: fs });
  const setSidebar = (type: SidebarType) =>
    dispatch({ type: 'SET_SIDEBAR', payload: type });
  const setCurrentChapter = (chapter: number | null) =>
    dispatch({ type: 'SET_CHAPTER', payload: chapter });

  const setChapterList = (chapter: string[] | null) =>
    dispatch({ type: 'SET_CHAPTER_LIST', payload: chapter });

  return (
    <ReaderContext.Provider
      value={{
        preferences,
        setTheme,
        setFontSize,
        setSidebar,
        setCurrentChapter,
        setChapterList,
      }}
    >
      {children}
    </ReaderContext.Provider>
  );
};

export const useReader = () => {
  const context = useContext(ReaderContext);
  if (!context) {
    throw new Error('useReader must be used within a ReaderProvider');
  }
  return context;
};
