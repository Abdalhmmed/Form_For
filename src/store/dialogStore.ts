import { create } from 'zustand';
import { ConfirmOptions, ConfirmState } from '../types/dialog';

interface DialogStore {
  confirmState: ConfirmState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
}

export const useDialog = create<DialogStore>((set, get) => ({
  confirmState: null,
  confirm: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        confirmState: {
          ...options,
          isOpen: true,
          resolve,
        },
      });
    });
  },
  closeConfirm: (result: boolean) => {
    const state = get().confirmState;
    if (state) {
      state.resolve(result);
    }
    set({ confirmState: null });
  },
}));
