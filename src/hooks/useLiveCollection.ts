import { useEffect, useState } from 'react';
import { listenCollection, type ListenOptions } from '../services/content';
import { isFirebaseConfigured } from '../lib/firebase';
import { errorMessage } from '../lib/utils';

export function useLiveCollection<T extends { id: string }>(name: string, opts: ListenOptions = {}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify([name, opts]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    const unsubscribe = listenCollection<T>(
      name,
      (data) => {
        setItems(data);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(errorMessage(err));
        setLoading(false);
      },
      opts,
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, loading, error };
}
