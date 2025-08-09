import {
  IonButton,
  IonButtons,
  IonContent,
  IonInput,
  IonItem,
  IonNote,
  IonPage,
} from '@ionic/react';
import './SchoolBusPermit.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Keyboard } from '@capacitor/keyboard';
import SchoolBusPermitCard from './SchoolBusPermitCard';
import { useAppState } from '@app/providers/AppState';

type Permit = { name: string; sid: string; major: string; expiry: string };
const EMPTY: Permit = { name: '', sid: '', major: '', expiry: '' };

const SchoolBusPermit: React.FC = () => {
  const { t, i18n } = useTranslation('global');
  const { appSettings, setAppSettings } = useAppState();

  const desc = i18n.language.includes('en')
    ? 'The bus pass provided on this website is a creative work intended solely for entertainment purposes and is not an official document issued, endorsed, or authorized by The Chinese University of Hong Kong or any of its affiliated departments. According to current regulations, students are required to present a student ID or other valid identification (excluding the bus pass) when boarding the university shuttle buses. This bus pass holds no official function and should not be used for identification or any other purposes. For any inquiries, please contact the official representatives of The Chinese University of Hong Kong.'
    : '本網站所展示的校巴證僅為創作作品，旨在提供趣味性及娛樂用途，並非由香港中文大學或其任何相關部門授權、認可或發行的正式證件。根據現行規定，乘搭校巴需出示學生證或其他有效證件（校巴證不在此列）。本校巴證不具任何實際功能，亦不可作為身份識別或其他用途。如有疑問，請聯絡香港中文大學官方機構查詢。';

  // load saved settings → local form
  const saved: Permit = {
    name: appSettings.schoolBusPermit?.name ?? '',
    sid: appSettings.schoolBusPermit?.sid ?? '',
    major: appSettings.schoolBusPermit?.major ?? '',
    expiry: appSettings.schoolBusPermit?.expiry ?? '',
  };

  const [form, setForm] = useState<Permit>(saved);
  const [mode, setMode] = useState<'edit' | 'view'>(saved.name ? 'view' : 'edit');

  // keep form in sync if settings change elsewhere (don’t auto-toggle mode)
  useEffect(() => {
    setForm(saved);
  }, [
    appSettings.schoolBusPermit?.name,
    appSettings.schoolBusPermit?.sid,
    appSettings.schoolBusPermit?.major,
    appSettings.schoolBusPermit?.expiry,
  ]);

  // nicer mobile keyboard bar
  useEffect(() => {
    Keyboard.setAccessoryBarVisible({ isVisible: true });
    return () => Keyboard.setAccessoryBarVisible({ isVisible: false });
  }, []);

  // IonInput helpers
  const onVal =
    (key: keyof Permit, upper = false) =>
    (e: CustomEvent<{ value?: string | null }>) => {
      const raw = typeof e.detail?.value === 'string' ? e.detail.value : form[key];
      setForm((p) => ({ ...p, [key]: upper ? raw.toUpperCase() : raw }));
    };

  const save = useCallback(() => {
    const trimmed: Permit = {
      name: form.name.trim(),
      sid: form.sid.trim(),
      major: form.major.trim().toUpperCase(),
      expiry: form.expiry.trim(),
    };
    if (!trimmed.name || !trimmed.sid || !trimmed.major || !trimmed.expiry) {
      window.alert(t('Permit_Input_All'));
      return;
    }
    setAppSettings((prev: any) => ({ ...prev, schoolBusPermit: trimmed }));
    setForm(trimmed);
    setMode('view'); // ✅ switch only on explicit save
  }, [form, setAppSettings, t]);

  return (
    <IonPage className="pageSafeArea">
      <IonContent>
        {mode === 'edit' ? (
          <div className="busPermitInputContent">
            <div className="busPermitInputModalDesc">
              <IonNote color="medium">{desc}</IonNote>
            </div>

            <IonItem>
              <IonInput
                label={t('School_Bus_Permit_Name')}
                labelPlacement="stacked"
                value={form.name}
                clearOnEdit={false}
                onIonInput={onVal('name')}
                placeholder="Vanessa"
                type="text"
                enterkeyhint="done"
              />
            </IonItem>

            <IonItem>
              <IonInput
                label={t('School_Bus_Permit_SID')}
                labelPlacement="stacked"
                value={form.sid}
                clearOnEdit={false}
                onIonInput={onVal('sid')}
                placeholder="1155123456"
                inputmode="numeric"
                type="text"
                enterkeyhint="done"
              />
            </IonItem>

            <IonItem>
              <IonInput
                label={t('School_Bus_Permit_Major')}
                labelPlacement="stacked"
                value={form.major}
                clearOnEdit={false}
                onIonInput={onVal('major', true)}
                placeholder="CSCIN"
                type="text"
                enterkeyhint="done"
              />
            </IonItem>

            <IonItem>
              <IonInput
                label={t('School_Bus_Permit_Exp')}
                labelPlacement="stacked"
                value={form.expiry}
                clearOnEdit={false}
                onIonInput={onVal('expiry')}
                placeholder="4/1989"
                type="text"
                enterkeyhint="done"
              />
            </IonItem>

            <IonButtons className="ion-padding showPermitButtons">
              <IonButton onClick={save}>{t('Permit_Save')}</IonButton>
              {saved.name && (
                <IonButton
                  fill="clear"
                  onClick={() => {
                    setForm(saved); // revert edits
                    setMode('view');
                  }}
                >
                  {t('Cancel')}
                </IonButton>
              )}
            </IonButtons>
          </div>
        ) : (
          <>
            <div className="busPermitInputModalDescPermit">
              <IonNote color="medium">{desc}</IonNote>
            </div>
            <SchoolBusPermitCard permit={form} busMode="shuttle_bus" />
            <SchoolBusPermitCard permit={form} busMode="meet_class_bus" />
            <IonButtons className="ion-padding showPermitButtons">
              <IonButton onClick={() => setMode('edit')}>{t('Permit_Edit')}</IonButton>
              <IonButton
                fill="clear"
                onClick={() => {
                  setForm({ ...EMPTY });
                  setMode('edit');
                }}
              >
                {t('Clear')}
              </IonButton>
            </IonButtons>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SchoolBusPermit;
