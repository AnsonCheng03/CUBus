import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';

type AppState = 'active' | 'inactive';

export function useCapacitorAppState(): AppState {
  const [state, setState] = useState<AppState>('active');

  useEffect(() => {
    const sub = App.addListener('appStateChange', ({ isActive }) => {
      setState(isActive ? 'active' : 'inactive');
    });
    return () => {
      sub.then((l) => l.remove());
    };
  }, []);

  return state;
}
