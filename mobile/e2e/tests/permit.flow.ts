import type { Browser } from 'webdriverio';
import { expectNotVisible, expectVisible, tap, typeInto } from '../helpers/session';

export async function runPermitFlow(driver: Browser) {
  await tap(driver, 'nav-permit');
  await expectVisible(driver, 'permit-form');

  await tap(driver, 'permit-save-button');
  await expectVisible(driver, 'permit-form');

  await typeInto(driver, 'permit-input-name', 'Ada Lovelace');
  await typeInto(driver, 'permit-input-sid', '1155123456');
  await typeInto(driver, 'permit-input-major', 'CSCI');
  await typeInto(driver, 'permit-input-expiry', '06/2026');
  await tap(driver, 'permit-save-button');

  await expectVisible(driver, 'permit-card-shuttle');
  await tap(driver, 'permit-card-shuttle');
  await expectVisible(driver, 'permit-card-fullscreen');
  await tap(driver, 'permit-fullscreen-backdrop');
  await expectNotVisible(driver, 'permit-card-fullscreen');
}
