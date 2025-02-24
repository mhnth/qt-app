'use client';

import {
  ReactNode,
  useState,
  useEffect,
  useContext,
  createContext,
} from 'react';
import { useIndexedDB } from './useIndexedDB';
import { QTManager } from './QT-manager';

interface QTContextInterface {
  loading: boolean;
  getQTPairs: (rawText: string) =>
    | {
        viArr: string[];
        zhArr: string[];
      }
    | undefined;
  revalidate: () => void;
  translateQT: (rawText: string, hv: boolean) => string | undefined;
  addToPersonalDictionary: ({ zh, vi }: { zh: string; vi: string }) => void;
  getPersonalDictionary: () => [zh: string, vi: string][];
  updatePersonalDictionary: (newDict: [string, string][]) => void;
  deleteWord: (word: string) => void;
}

const QTContext = createContext<QTContextInterface | undefined>(undefined);

export const QTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { saveData, loadData } = useIndexedDB();
  const [contextManager, setContextManager] = useState<QTManager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const manager = new QTManager(saveData, loadData);
    setContextManager(manager);
    manager.loadDictionary().then(() => {
      setLoading(false);
    });
  }, [saveData, loadData]);

  if (!contextManager) {
    return (
      <div className="flex justify-center items-center mt-20">
        Loading dictionary...
      </div>
    );
  }

  const revalidateQT = async () => {
    setLoading(true);
    await contextManager.revalidate();
    // const manager = new QTManager(saveData, loadData);
    // setContextManager(manager);
    // manager.loadDictionary().then(() => {
    //   setLoading(false);
    // });
    setLoading(false);

    // setLoading(true);

    // Xóa contextManager trước khi tạo lại
    // setContextManager(null);

    // await clearDB(); // Xóa dữ liệu cũ trong IndexedDB

    // const newManager = new QTManager(saveData, loadData);
    // await newManager.loadDictionary(); // Đảm bảo dữ liệu mới được tải

    // setContextManager(newManager);
    // setLoading(false);
  };

  return (
    <QTContext.Provider
      value={{
        loading: loading,
        getQTPairs: contextManager.getQTPairs.bind(contextManager),
        revalidate: revalidateQT,
        translateQT: contextManager.translateQT.bind(contextManager),
        addToPersonalDictionary:
          contextManager.addToPersonalDictionary.bind(contextManager),
        getPersonalDictionary:
          contextManager.getPersonalDictionary.bind(contextManager),
        updatePersonalDictionary:
          contextManager.updatePersonalDictionary.bind(contextManager),
        deleteWord: contextManager.deleteWord.bind(contextManager),
      }}
    >
      {children}
    </QTContext.Provider>
  );
};

export const useQT = () => {
  const context = useContext(QTContext);
  if (context === undefined) {
    throw new Error('useQTContext must be used within a QTProvider');
  }

  return context;
};
