import assert from 'node:assert/strict';
import { remote, type Browser } from 'webdriverio';

type Platform = 'android' | 'ios';

export async function startSession(platform: Platform): Promise<Browser> {
  const isAndroid = platform === 'android';
  const appPath = isAndroid ? process.env.E2E_ANDROID_APP_PATH : process.env.E2E_IOS_APP_PATH;

  return remote({
    hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
    port: Number(process.env.APPIUM_PORT ?? 4723),
    path: process.env.APPIUM_PATH ?? '/',
    capabilities: isAndroid
      ? {
          platformName: 'Android',
          'appium:automationName': 'UiAutomator2',
          'appium:appPackage': process.env.E2E_ANDROID_APP_PACKAGE ?? 'com.cubus.app',
          'appium:appActivity': process.env.E2E_ANDROID_APP_ACTIVITY ?? 'com.cubus.app.MainActivity',
          'appium:app': appPath,
          'appium:autoGrantPermissions': true,
          'appium:newCommandTimeout': 180,
        }
      : {
          platformName: 'iOS',
          'appium:automationName': 'XCUITest',
          'appium:bundleId': process.env.E2E_IOS_BUNDLE_ID ?? 'com.cubus.app',
          'appium:app': appPath,
          'appium:newCommandTimeout': 180,
        },
  });
}

export async function expectVisible(driver: Browser, id: string) {
  const element = await driver.$(`~${id}`);
  await element.waitForDisplayed({ timeout: 20_000 });
  return element;
}

export async function tap(driver: Browser, id: string) {
  const element = await expectVisible(driver, id);
  await element.click();
}

export async function typeInto(driver: Browser, id: string, value: string) {
  const element = await expectVisible(driver, id);
  await element.setValue(value);
}

export async function expectNotVisible(driver: Browser, id: string) {
  const element = await driver.$(`~${id}`);
  await element.waitForDisplayed({ timeout: 10_000, reverse: true });
}

export async function expectText(driver: Browser, text: string) {
  const element = await driver.$(`//*[@text="${text}" or @label="${text}" or @name="${text}"]`);
  await element.waitForDisplayed({ timeout: 20_000 });
}

export async function expectAnyVisible(driver: Browser, ids: string[]) {
  for (const id of ids) {
    const element = await driver.$(`~${id}`);
    if (await element.isDisplayed().catch(() => false)) {
      return element;
    }
  }

  assert.fail(`None of the expected selectors were visible: ${ids.join(', ')}`);
}
