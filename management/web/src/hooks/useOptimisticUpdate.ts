import { useState, useCallback, useRef } from 'react';

interface OptimisticState<T> {
      data: T[];
      isLoading: boolean;
      error: Error | null;
      pendingChanges: Map<string, 'add' | 'update' | 'delete'>;
}

interface OptimisticUpdateResult<T> {
      // State
      data: T[];
      isLoading: boolean;
      error: Error | null;
      isPending: (id: string) => boolean;
      getPendingType: (id: string) => 'add' | 'update' | 'delete' | null;

      // Actions
      setData: (data: T[]) => void;
      setLoading: (loading: boolean) => void;
      setError: (error: Error | null) => void;

      // Optimistic operations
      optimisticAdd: (item: T, asyncOperation: () => Promise<string>) => Promise<string | null>;
      optimisticUpdate: (id: string, updates: Partial<T>, asyncOperation: () => Promise<void>) => Promise<boolean>;
      optimisticDelete: (id: string, asyncOperation: () => Promise<void>) => Promise<boolean>;

      // Rollback
      rollback: () => void;
}

/**
 * Optimistic updates için custom hook
 *
 * Bu hook, UI'ın hızlı hissetmesi için verileri önce yerel olarak günceller,
 * ardından asenkron işlemi başlatır. Hata durumunda otomatik geri alır.
 *
 * @example
 * const {
 *   data: expenses,
 *   setData,
 *   optimisticAdd,
 *   optimisticUpdate,
 *   optimisticDelete,
 *   isPending
 * } = useOptimisticUpdate<Expense>('id');
 *
 * // Veri yükle
 * useEffect(() => {
 *   getExpenses().then(setData);
 * }, []);
 *
 * // Optimistic add
 * const handleAdd = async (newExpense: Expense) => {
 *   const id = await optimisticAdd(newExpense, () => createExpense(newExpense));
 *   if (id) console.log('Başarıyla eklendi:', id);
 * };
 *
 * // Optimistic update
 * const handleUpdate = async (id: string, updates: Partial<Expense>) => {
 *   const success = await optimisticUpdate(id, updates, () => updateExpense(id, updates));
 *   if (success) console.log('Başarıyla güncellendi');
 * };
 *
 * // Optimistic delete
 * const handleDelete = async (id: string) => {
 *   const success = await optimisticDelete(id, () => deleteExpense(id));
 *   if (success) console.log('Başarıyla silindi');
 * };
 */
export function useOptimisticUpdate<T extends { id: string }>(
      idField: keyof T = 'id' as keyof T
): OptimisticUpdateResult<T> {
      const [state, setState] = useState<OptimisticState<T>>({
            data: [],
            isLoading: false,
            error: null,
            pendingChanges: new Map(),
      });

      // Rollback için önceki state'i sakla
      const previousDataRef = useRef<T[]>([]);

      const setData = useCallback((data: T[]) => {
            setState((prev) => ({ ...prev, data, error: null }));
      }, []);

      const setLoading = useCallback((isLoading: boolean) => {
            setState((prev) => ({ ...prev, isLoading }));
      }, []);

      const setError = useCallback((error: Error | null) => {
            setState((prev) => ({ ...prev, error }));
      }, []);

      const isPending = useCallback((id: string): boolean => {
            return state.pendingChanges.has(id);
      }, [state.pendingChanges]);

      const getPendingType = useCallback((id: string): 'add' | 'update' | 'delete' | null => {
            return state.pendingChanges.get(id) || null;
      }, [state.pendingChanges]);

      const rollback = useCallback(() => {
            setState((prev) => ({
                  ...prev,
                  data: previousDataRef.current,
                  pendingChanges: new Map(),
            }));
      }, []);

      /**
       * Optimistic Add - Yeni öğe ekler
       */
      const optimisticAdd = useCallback(async (
            item: T,
            asyncOperation: () => Promise<string>
      ): Promise<string | null> => {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const tempItem = { ...item, [idField]: tempId } as T;

            // Önceki state'i kaydet
            previousDataRef.current = state.data;

            // Optimistic update - UI'a hemen ekle
            setState((prev) => ({
                  ...prev,
                  data: [tempItem, ...prev.data],
                  pendingChanges: new Map(prev.pendingChanges).set(tempId, 'add'),
                  error: null,
            }));

            try {
                  // Asenkron işlemi başlat
                  const realId = await asyncOperation();

                  // Gerçek ID ile güncelle
                  setState((prev) => {
                        const newPendingChanges = new Map(prev.pendingChanges);
                        newPendingChanges.delete(tempId);

                        return {
                              ...prev,
                              data: prev.data.map((d) =>
                                    (d as any)[idField] === tempId
                                          ? { ...d, [idField]: realId }
                                          : d
                              ),
                              pendingChanges: newPendingChanges,
                        };
                  });

                  return realId;
            } catch (error) {
                  // Hata durumunda geri al
                  setState((prev) => {
                        const newPendingChanges = new Map(prev.pendingChanges);
                        newPendingChanges.delete(tempId);

                        return {
                              ...prev,
                              data: prev.data.filter((d) => (d as any)[idField] !== tempId),
                              pendingChanges: newPendingChanges,
                              error: error instanceof Error ? error : new Error('Ekleme başarısız'),
                        };
                  });

                  return null;
            }
      }, [state.data, idField]);

      /**
       * Optimistic Update - Mevcut öğeyi günceller
       */
      const optimisticUpdate = useCallback(async (
            id: string,
            updates: Partial<T>,
            asyncOperation: () => Promise<void>
      ): Promise<boolean> => {
            // Önceki state'i kaydet
            previousDataRef.current = state.data;

            // Önceki değeri bul
            const previousItem = state.data.find((d) => (d as any)[idField] === id);
            if (!previousItem) {
                  setState((prev) => ({
                        ...prev,
                        error: new Error('Güncellenecek öğe bulunamadı'),
                  }));
                  return false;
            }

            // Optimistic update - UI'ı hemen güncelle
            setState((prev) => ({
                  ...prev,
                  data: prev.data.map((d) =>
                        (d as any)[idField] === id ? { ...d, ...updates } : d
                  ),
                  pendingChanges: new Map(prev.pendingChanges).set(id, 'update'),
                  error: null,
            }));

            try {
                  // Asenkron işlemi başlat
                  await asyncOperation();

                  // Pending durumunu kaldır
                  setState((prev) => {
                        const newPendingChanges = new Map(prev.pendingChanges);
                        newPendingChanges.delete(id);
                        return { ...prev, pendingChanges: newPendingChanges };
                  });

                  return true;
            } catch (error) {
                  // Hata durumunda geri al
                  setState((prev) => {
                        const newPendingChanges = new Map(prev.pendingChanges);
                        newPendingChanges.delete(id);

                        return {
                              ...prev,
                              data: prev.data.map((d) =>
                                    (d as any)[idField] === id ? previousItem : d
                              ),
                              pendingChanges: newPendingChanges,
                              error: error instanceof Error ? error : new Error('Güncelleme başarısız'),
                        };
                  });

                  return false;
            }
      }, [state.data, idField]);

      /**
       * Optimistic Delete - Öğeyi siler
       */
      const optimisticDelete = useCallback(async (
            id: string,
            asyncOperation: () => Promise<void>
      ): Promise<boolean> => {
            // Önceki state'i kaydet
            previousDataRef.current = state.data;

            // Silinen öğeyi bul
            const deletedItem = state.data.find((d) => (d as any)[idField] === id);
            if (!deletedItem) {
                  setState((prev) => ({
                        ...prev,
                        error: new Error('Silinecek öğe bulunamadı'),
                  }));
                  return false;
            }

            // Optimistic delete - UI'dan hemen kaldır
            setState((prev) => ({
                  ...prev,
                  data: prev.data.filter((d) => (d as any)[idField] !== id),
                  pendingChanges: new Map(prev.pendingChanges).set(id, 'delete'),
                  error: null,
            }));

            try {
                  // Asenkron işlemi başlat
                  await asyncOperation();

                  // Pending durumunu kaldır
                  setState((prev) => {
                        const newPendingChanges = new Map(prev.pendingChanges);
                        newPendingChanges.delete(id);
                        return { ...prev, pendingChanges: newPendingChanges };
                  });

                  return true;
            } catch (error) {
                  // Hata durumunda geri ekle
                  setState((prev) => {
                        const newPendingChanges = new Map(prev.pendingChanges);
                        newPendingChanges.delete(id);

                        // Silinen öğeyi orijinal konumuna ekle
                        const originalIndex = previousDataRef.current.findIndex(
                              (d) => (d as any)[idField] === id
                        );
                        const newData = [...prev.data];
                        newData.splice(originalIndex, 0, deletedItem);

                        return {
                              ...prev,
                              data: newData,
                              pendingChanges: newPendingChanges,
                              error: error instanceof Error ? error : new Error('Silme başarısız'),
                        };
                  });

                  return false;
            }
      }, [state.data, idField]);

      return {
            data: state.data,
            isLoading: state.isLoading,
            error: state.error,
            isPending,
            getPendingType,
            setData,
            setLoading,
            setError,
            optimisticAdd,
            optimisticUpdate,
            optimisticDelete,
            rollback,
      };
}

/**
 * Basit bir mutation için optimistic update wrapper
 */
export async function withOptimisticUpdate<T>(
      optimisticFn: () => void,
      asyncFn: () => Promise<T>,
      rollbackFn: () => void
): Promise<T | null> {
      // Optimistic update
      optimisticFn();

      try {
            // Async operation
            const result = await asyncFn();
            return result;
      } catch (error) {
            // Rollback on error
            rollbackFn();
            console.error('Optimistic update failed:', error);
            return null;
      }
}
