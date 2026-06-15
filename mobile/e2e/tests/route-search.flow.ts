import type { Browser } from 'webdriverio';
import { expectVisible, tap, typeInto } from '../helpers/session';

export async function runRouteSearchFlow(driver: Browser) {
  await tap(driver, 'nav-route');
  await expectVisible(driver, 'route-search-screen');

  await typeInto(driver, 'route-search-start-input', 'MTR (MTR)');
  await typeInto(driver, 'route-search-dest-input', 'NAC (NAC)');

  await expectVisible(driver, 'route-result-0');
  await tap(driver, 'route-result-0');
  await expectVisible(driver, 'route-map-modal');
  await tap(driver, 'route-map-close');
}
