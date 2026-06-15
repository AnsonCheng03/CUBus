import type { Browser } from 'webdriverio';
import { expectVisible, tap } from '../helpers/session';

export async function runSettingsFlow(driver: Browser) {
  await tap(driver, 'nav-settings');
  await expectVisible(driver, 'settings-change-language');
  await expectVisible(driver, 'settings-no-wait-switch');

  await tap(driver, 'settings-bus-map');
  await expectVisible(driver, 'bus-map-modal');
  await tap(driver, 'bus-map-close');
}
