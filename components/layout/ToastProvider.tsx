"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";
type ToastActionVariant = "primary" | "danger" | "ghost";

type ToastAction = {
  label: string;
  variant?: ToastActionVariant;
  onClick: () => void;
};

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  persistent?: boolean;
};

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ToastType;
};

type ToastOptions = {
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
};

type ToastContextValue = {
  showToast: (
    message: string,
    type?: ToastType,
    options?: ToastOptions,
  ) => number;
  success: (message: string, options?: ToastOptions) => number;
  error: (message: string, options?: ToastOptions) => number;
  info: (message: string, options?: ToastOptions) => number;
  warning: (message: string, options?: ToastOptions) => number;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3200;

function getToastIcon(type: ToastType) {
  switch (type) {
    case "success":
      return <CheckCircle2 size={18} />;
    case "error":
      return <AlertCircle size={18} />;
    case "warning":
      return <TriangleAlert size={18} />;
    default:
      return <Info size={18} />;
  }
}

function getToastClasses(type: ToastType) {
  switch (type) {
    case "success":
      return "border-success/30 bg-success/10 text-success";
    case "error":
      return "border-danger/30 bg-danger/10 text-danger";
    case "warning":
      return "border-warning/30 bg-warning/10 text-warning";
    default:
      return "border-accent-neon/30 bg-accent-neon/10 text-accent-neon";
  }
}

function getActionClasses(variant: ToastActionVariant = "primary") {
  switch (variant) {
    case "danger":
      return "bg-danger text-white hover:bg-red-600";
    case "ghost":
      return "bg-bg-secondary text-text-secondary hover:text-text-primary border border-border-subtle hover:bg-bg-primary";
    default:
      return "bg-accent-primary text-white hover:bg-red-600";
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    id: number;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    type: ToastType;
    resolve: (result: boolean) => void;
  } | null>(null);
  const idRef = useRef(1);
  const timersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: number) => {
    const timer = timersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", options: ToastOptions = {}) => {
      const id = idRef.current++;
      const toast: ToastItem = {
        id,
        message,
        type,
        persistent: options.persistent,
      };

      setToasts((prev) => [toast, ...prev]);

      if (!options.persistent) {
        const duration = options.duration ?? DEFAULT_DURATION;
        timersRef.current[id] = setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast],
  );

  const confirm = useCallback(
    (message: string, options: ConfirmOptions = {}) => {
      return new Promise<boolean>((resolve) => {
        const id = idRef.current++;
        const confirmLabel = options.confirmLabel ?? "Xóa";
        const cancelLabel = options.cancelLabel ?? "Hủy";
        const type = options.type ?? "warning";

        setConfirmDialog((current) => {
          if (current) {
            current.resolve(false);
          }

          return {
            id,
            title: options.title ?? "Xác nhận thao tác",
            message,
            confirmLabel,
            cancelLabel,
            type,
            resolve,
          };
        });
      });
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message, options) => showToast(message, "success", options),
      error: (message, options) => showToast(message, "error", options),
      info: (message, options) => showToast(message, "info", options),
      warning: (message, options) => showToast(message, "warning", options),
      confirm,
    }),
    [confirm, showToast],
  );

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-[min(100vw-1rem,22rem)] flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border shadow-2xl backdrop-blur-md p-4 ${getToastClasses(toast.type)} bg-bg-primary/95`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{getToastIcon(toast.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
                aria-label="Đóng thông báo"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-card shadow-2xl overflow-hidden">
            <div
              className={`px-5 py-4 border-b border-border-subtle ${getToastClasses(confirmDialog.type)}`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {getToastIcon(confirmDialog.type)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Vui lòng xác nhận thao tác bên dưới.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-sm text-text-primary leading-relaxed">
                {confirmDialog.message}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.resolve(false);
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  {confirmDialog.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    confirmDialog.resolve(true);
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-danger text-white font-bold hover:bg-red-600 transition-colors"
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
