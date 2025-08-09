import { useEffect, useState } from 'react';
type Visibility = 'visible' | 'hidden';

export function useAppVisibility(): Visibility {
  const [vis, setVis] = useState<Visibility>(
    document.visibilityState === 'visible' ? 'visible' : 'hidden',
  );
  useEffect(() => {
    const handler = () => setVis(document.visibilityState === 'visible' ? 'visible' : 'hidden');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);
  return vis;
}
