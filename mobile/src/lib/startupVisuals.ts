import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

const startupAssetModules: number[] = [
  require('../assets/bus.jpg'),
  require('../assets/splash-loading.png'),
  require('../assets/busMoving.gif'),
  require('../assets/alert.png'),
  require('../assets/info.png'),
  require('../assets/critical.png'),
  require('../assets/schoolbusmap.svg'),
  require('../assets/schbus_d.png'),
  require('../assets/schbus_l.png'),
  require('../assets/cuhk_logo.png'),
  require('../../../resources/icon.png'),
];

let preloadPromise: Promise<void> | null = null;

export function preloadStartupVisuals() {
  preloadPromise ??= Promise.allSettled([
    ...startupAssetModules.map((moduleId) =>
      Promise.resolve().then(() => Asset.loadAsync(moduleId)),
    ),
    Promise.resolve().then(() => Font.loadAsync(Ionicons.font)),
  ]).then((results) => {
    const failedLoads = results.filter((result) => result.status === 'rejected');
    if (failedLoads.length > 0) {
      console.warn(`[startup] ${failedLoads.length} visual asset preload(s) failed`);
    }
  });

  return preloadPromise;
}
