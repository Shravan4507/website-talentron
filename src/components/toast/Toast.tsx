import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove after specified duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          let startX = 0;
          let currentX = 0;
          let isSwiping = false;

          const handleTouchStart = (e: React.TouchEvent) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
          };

          const handleTouchMove = (e: React.TouchEvent) => {
            if (!isSwiping) return;
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            const element = e.currentTarget as HTMLElement;
            
            // Allow swiping only to the right for dismissal
            if (diff > 0) {
              element.style.transform = `translateX(${diff}px)`;
              element.style.opacity = `${1 - (diff / 200)}`;
            }
          };

          const handleTouchEnd = (e: React.TouchEvent, id: string) => {
            if (!isSwiping) return;
            isSwiping = false;
            const diff = currentX - startX;
            const element = e.currentTarget as HTMLElement;

            if (diff > 100) {
              // Swipe threshold met
              element.style.transform = `translateX(150%)`;
              element.style.opacity = '0';
              setTimeout(() => removeToast(id), 200);
            } else {
              // Reset position
              element.style.transform = '';
              element.style.opacity = '';
            }
          };

          return (
            <div 
              key={toast.id} 
              className={`toast toast-${toast.type}`} 
              onClick={() => removeToast(toast.id)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={(e) => handleTouchEnd(e, toast.id)}
            >
              <div className="toast-content">
                {toast.message}
              </div>
              <div 
                className="toast-progress" 
                style={{ animationDuration: `${toast.duration}ms` }}
              ></div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
