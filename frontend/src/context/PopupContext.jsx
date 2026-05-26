import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState
} from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';

const PopupContext = createContext(null);

const TOAST_DEFAULT_DURATION = 4000;

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    container: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconClass: 'text-emerald-600'
  },
  error: {
    icon: AlertCircle,
    container: 'border-red-200 bg-red-50 text-red-900',
    iconClass: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    iconClass: 'text-amber-600'
  },
  info: {
    icon: Info,
    container: 'border-blue-200 bg-blue-50 text-blue-900',
    iconClass: 'text-blue-600'
  }
};

function ToastItem({ toast, onDismiss }) {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={`flex items-start gap-3 min-w-[280px] max-w-sm rounded-xl border px-4 py-3 shadow-lg animate-slideIn ${style.container}`}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${style.iconClass}`} aria-hidden />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function DialogShell({ dialog, onResolve }) {
  const titleId = useId();
  const isConfirm = dialog.kind === 'confirm';
  const isDanger = dialog.variant === 'danger';

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onResolve(isConfirm ? false : undefined);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isConfirm, onResolve]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      role="presentation"
      onClick={() => onResolve(isConfirm ? false : undefined)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl animate-slideUp overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 id={titleId} className="text-lg font-bold text-white">
            {dialog.title}
          </h2>
        </div>
        <div className="px-6 py-5">
          {typeof dialog.message === 'string' ? (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {dialog.message}
            </p>
          ) : (
            dialog.message
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          {isConfirm ? (
            <>
              <button
                type="button"
                onClick={() => onResolve(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                {dialog.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => onResolve(true)}
                className={`px-5 py-2.5 rounded-lg font-medium text-white transition-colors ${
                  isDanger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {dialog.confirmLabel || 'Confirm'}
              </button>
            </>
          ) : (
            <button
              type="button"
              autoFocus
              onClick={() => onResolve(undefined)}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {dialog.buttonLabel || 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PopupProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const dialogResolverRef = useRef(null);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((messageOrOptions, type = 'info') => {
    const options =
      typeof messageOrOptions === 'string'
        ? { message: messageOrOptions, type }
        : messageOrOptions;

    const id = ++toastIdRef.current;
    setToasts((current) => [
      ...current,
      {
        id,
        message: options.message,
        type: options.type || 'info',
        duration: options.duration ?? TOAST_DEFAULT_DURATION
      }
    ]);
    return id;
  }, []);

  const toast = useCallback(
    (message, options) => showToast({ message, ...options }),
    [showToast]
  );
  toast.success = (message, options) => showToast({ message, type: 'success', ...options });
  toast.error = (message, options) => showToast({ message, type: 'error', ...options });
  toast.warning = (message, options) => showToast({ message, type: 'warning', ...options });
  toast.info = (message, options) => showToast({ message, type: 'info', ...options });

  const openDialog = useCallback((kind, options = {}) => {
    return new Promise((resolve) => {
      dialogResolverRef.current = resolve;
      setDialog({
        kind,
        title: options.title || (kind === 'confirm' ? 'Confirm' : 'Notice'),
        message: options.message || '',
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        buttonLabel: options.buttonLabel,
        variant: options.variant || 'primary'
      });
    });
  }, []);

  const confirm = useCallback(
    (options) => openDialog('confirm', options),
    [openDialog]
  );

  const alert = useCallback(
    (options) => {
      const normalized =
        typeof options === 'string' ? { message: options } : options;
      return openDialog('alert', normalized);
    },
    [openDialog]
  );

  const notice = alert;

  const resolveDialog = useCallback((result) => {
    const resolve = dialogResolverRef.current;
    dialogResolverRef.current = null;
    setDialog(null);
    resolve?.(result);
  }, []);

  const value = {
    toast,
    showToast,
    confirm,
    alert,
    notice,
    dismissToast
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-110 flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem toast={item} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
      {dialog ? <DialogShell dialog={dialog} onResolve={resolveDialog} /> : null}
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
}
