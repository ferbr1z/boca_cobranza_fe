import { useState, useCallback } from 'react';

export type ModalType = 'add' | 'edit' | 'delete' | 'details' | 'export-csv' | 'export-xlsx' | 'export-print' | null;

export interface ModalState {
  type: ModalType;
  id?: number | string;
  data?: any;
}

export function useOpenModal() {
  const [modalState, setModalState] = useState<ModalState>({ type: null });

  const openModal = useCallback((type: ModalType, id?: number | string, data?: any) => {
    setModalState({ type, id, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ type: null });
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    isOpen: modalState.type !== null,
  };
}
