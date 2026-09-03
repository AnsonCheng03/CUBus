import React from 'react';
import { Alert } from 'react-native';
import { act } from 'react';
import { fireEvent, render } from '@testing-library/react-native';
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

jest.mock('../../lib/sentry', () => ({
  showFeedbackWidget: jest.fn(),
}));

const mockShowFeedbackWidget = jest.mocked(
  jest.requireMock('../../lib/sentry').showFeedbackWidget,
);

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../components/BusMapModal', () => ({
  BusMapModal: () => null,
}));

describe('SettingsScreen', () => {
  it('renders the settings header actions', async () => {
    const { getByText } = await render(<SettingsScreen />);
    expect(getByText('Delete-Storage')).toBeTruthy();
    expect(getByText('Reload-Data')).toBeTruthy();
  });

  it('shows the language row and bus map entry', async () => {
    const { getByText } = await render(<SettingsScreen />);
    expect(getByText('settings_change_language')).toBeTruthy();
    expect(getByText('bus_map_page')).toBeTruthy();
  });

  it('opens the Sentry feedback widget from the report problem row', async () => {
    mockShowFeedbackWidget.mockClear();
    const { getByTestId } = await render(<SettingsScreen />);

    fireEvent.press(getByTestId('settings-report-problem'));

    expect(mockShowFeedbackWidget).toHaveBeenCalledTimes(1);
  });

  it('confirms before deleting stored data', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockState.resetApp.mockClear();
    const { getByTestId } = await render(<SettingsScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('settings-delete-storage'));
    });

    expect(mockState.resetApp).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledTimes(1);

    const buttons = alertSpy.mock.calls[0][2];
    await act(async () => {
      buttons?.find((button) => button.style === 'destructive')?.onPress?.();
    });
    expect(mockState.resetApp).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});
