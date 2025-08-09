import { IonButton, IonPage } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './appCorruped.css';

import { clearAll } from '@shared/lib/storage';

const AppCorrupted: React.FC<{ missingData: string[] }> = ({ missingData }) => {
  const { t } = useTranslation('preset');

  const handleReset = async () => {
    try {
      // clear Ionic Storage (via shared helper)
      await clearAll();

      // unregister all service workers (offline cache, old assets)
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        regs.forEach((r) => r.unregister());
      }
    } catch (err) {
      // non‑fatal; reload anyway
      console.error(err);
    } finally {
      window.location.reload();
    }
  };

  return (
    <IonPage>
      <div className="appCorruptedContainer">
        <p className="appCorruptedText">{t('app_data_corrupted')}</p>
        {missingData?.length > 0 && (
          <span className="appCorruptedNote">{missingData.join(', ')}</span>
        )}
        <IonButton onClick={handleReset}>{t('reset_app')}</IonButton>
      </div>
    </IonPage>
  );
};

export default AppCorrupted;
