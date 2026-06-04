import React from 'react';
import { render } from '@testing-library/react-native';
import { SettingsScreen } from '../SettingsScreen';

const mockState = {
  appSettings: {},
  setAppSettings: jest.fn(),
  appData: { WebsiteLinks: [] },
  networkError: { batch: false, realtime: false },
  resetApp: jest.fn().mockResolvedValue(undefined),
  clearTemporaryState: jest.fn(),
  syncDelta: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../providers/AppProvider', () => ({
  useAppState: () => mockState,
}));

jest.mock('../../lib/i18n', () => ({
  i18next: {
    language: 'en',
    changeLanguage: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('SettingsScreen', () => {
  it('renders the settings header actions', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Delete-Storage')).toBeTruthy();
    expect(getByText('Reload-Data')).toBeTruthy();
  });

  it('shows the language row and bus map entry', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('轉換語言')).toBeTruthy();
    expect(getByText('bus_map_page')).toBeTruthy();
  });
});
