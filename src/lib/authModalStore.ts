import { create } from "zustand";

interface AuthModalState {
  isOpen: boolean;
  pendingAction: (() => void) | null;
  openModal: (action?: () => void) => void;
  closeModal: () => void;
  executePendingAction: () => void;
}

export const useAuthModal = create<AuthModalState>((set, get) => ({
  isOpen: false,
  pendingAction: null,
  openModal: (action) => set({ isOpen: true, pendingAction: action || null }),
  closeModal: () => set({ isOpen: false, pendingAction: null }),
  executePendingAction: () => {
    const { pendingAction } = get();
    if (pendingAction) {
      pendingAction();
    }
    set({ isOpen: false, pendingAction: null });
  },
}));
