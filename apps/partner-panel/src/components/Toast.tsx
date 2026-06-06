import type { ToastMessage } from '../types';

interface ToastStackProps {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ messages, onDismiss }: ToastStackProps) {
  return (
    <div className="toast-stack" aria-live="polite">
      {messages.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast toast--${toast.tone}`}
          onClick={() => onDismiss(toast.id)}
          aria-label={`${toast.title} bildirimi kapat`}
        >
          <strong>{toast.title}</strong>
          <span>{toast.message}</span>
        </button>
      ))}
    </div>
  );
}
