import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, description, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Modalı kapat">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
