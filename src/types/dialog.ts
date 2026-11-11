export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export type ConfirmState = (ConfirmOptions & {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}) | null;
