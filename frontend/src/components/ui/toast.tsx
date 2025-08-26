'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 150);
  };

  const getToastStyles = () => {
    const baseStyles = "relative flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-150 ease-in-out transform";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    const typeStyles = {
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800", 
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    };

    return `${baseStyles} translate-x-0 opacity-100 ${typeStyles[toast.type]}`;
  };

  const getIcon = () => {
    const iconStyles = "h-5 w-5 flex-shrink-0 mt-0.5";
    
    switch (toast.type) {
      case 'success':
        return <CheckCircle className={`${iconStyles} text-green-600`} />;
      case 'error':
        return <AlertCircle className={`${iconStyles} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconStyles} text-yellow-600`} />;
      case 'info':
        return <Info className={`${iconStyles} text-blue-600`} />;
      default:
        return <Info className={`${iconStyles} text-gray-600`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-xs opacity-90 mt-1 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={handleRemove}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Helper functions for quick toast usage
export const toast = {
  success: (title: string, message?: string) => {
    // This will be used with the hook
    return { type: 'success' as const, title, message };
  },
  error: (title: string, message?: string) => {
    return { type: 'error' as const, title, message };
  },
  warning: (title: string, message?: string) => {
    return { type: 'warning' as const, title, message };
  },
  info: (title: string, message?: string) => {
    return { type: 'info' as const, title, message };
  }
};