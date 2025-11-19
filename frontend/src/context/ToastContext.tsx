import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  dismissOnClick?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id' | 'createdAt'>) => {
      const id = crypto.randomUUID();
      setToasts(current => [
        ...current,
        { id, createdAt: Date.now(), ...toast },
      ]);
      setTimeout(() => {
        setToasts(current => current.filter(item => item.id !== id));
      }, 4500);
    },
    [setToasts]
  );

  const dismissToast = useCallback(
    (id: string) => {
      setToasts(current => current.filter(item => item.id !== id));
    },
    [setToasts]
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast,
    }),
    [toasts, pushToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}


