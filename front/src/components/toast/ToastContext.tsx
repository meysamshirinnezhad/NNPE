import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Toast = { id: number; message: string; type?: 'error' | 'success' | 'info' };

interface ToastContextType {
  push: (message: string, type?: 'error' | 'success' | 'info') => void;
  list: Toast[];
}

const ToastContext = createContext<ToastContextType>({ push: () => {}, list: [] });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  
  function push(message: string, type: 'error' | 'success' | 'info' = 'error') {
    const id = Date.now();
    setList(l => [...l, { id, message, type }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 3500);
  }
  
  return (
    <ToastContext.Provider value={{ push, list }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {list.map(t => (
          <div
            key={t.id}
            className={`rounded-xl shadow-lg px-4 py-3 text-sm font-medium animate-slide-up ${
              t.type === 'success' ? 'bg-green-600 text-white' :
              t.type === 'info' ? 'bg-blue-600 text-white' :
              'bg-red-600 text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <i className={`${
                t.type === 'success' ? 'ri-checkbox-circle-line' :
                t.type === 'info' ? 'ri-information-line' :
                'ri-error-warning-line'
              }`}></i>
              <span>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}