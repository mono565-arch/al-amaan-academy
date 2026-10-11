import { useEffect, useState } from 'react';
import { listenSettings } from '../services/content';
import { isFirebaseConfigured } from '../lib/firebase';
import { DEFAULT_SETTINGS } from '../lib/defaults';
import { errorMessage } from '../lib/utils';
import type { SiteSettings } from '../types';

/** Live site settings from settings/site, merged over the default branding. */
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return listenSettings(
      (data) => {
        setSettings({ ...DEFAULT_SETTINGS, ...(data ?? {}) } as SiteSettings);
        setLoading(false);
      },
      (err) => {
        setError(errorMessage(err));
        setLoading(false);
      },
    );
  }, []);

  return { settings, loading, error };
}
