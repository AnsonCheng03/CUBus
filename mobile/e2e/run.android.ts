import { startSession } from './helpers/session';
import { runPermitFlow } from './tests/permit.flow';
import { runRouteSearchFlow } from './tests/route-search.flow';
import { runSettingsFlow } from './tests/settings.flow';

async function main() {
  const driver = await startSession('android');

  try {
    await runPermitFlow(driver);
    await runSettingsFlow(driver);
    await runRouteSearchFlow(driver);
  } finally {
    await driver.deleteSession();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
