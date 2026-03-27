import { createContext, useCallback, useContext, useMemo, useState, type ReactNode, type FC } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, source?: string) => void;
  withLoading: <T>(promise: Promise<T>, source?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSources, setActiveSources] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((loading: boolean, source = 'default') => {
    setActiveSources((previous) => {
      if (loading) {
        if (previous[source]) {
          return previous;
        }
        return { ...previous, [source]: true };
      }

      if (!previous[source]) {
        return previous;
      }

      const nextSources = { ...previous };
      delete nextSources[source];
      return nextSources;
    });
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>, source = 'default'): Promise<T> => {
    setLoading(true, source);
    try {
      const result = await promise;
      return result;
    } finally {
      setLoading(false, source);
    }
  }, [setLoading]);

  const isLoading = useMemo(() => Object.keys(activeSources).length > 0, [activeSources]);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-700 font-medium">Carregando...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};
