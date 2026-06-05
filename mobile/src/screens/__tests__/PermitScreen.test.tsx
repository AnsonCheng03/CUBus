import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PermitScreen } from '../PermitScreen';

const mockSetAppSettings = jest.fn();
const mockState = {
  appSettings: {},
  setAppSettings: mockSetAppSettings,
};

jest.mock('../../providers/AppProvider', () => ({
  useAppState: () => mockState,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('../../components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Mock = ({ children }: { children?: React.ReactNode }) => <View>{children}</View>;

  return {
    __esModule: true,
    default: Mock,
    Defs: Mock,
    LinearGradient: Mock,
    Rect: Mock,
    Stop: Mock,
  };
});

describe('PermitScreen', () => {
  beforeEach(() => {
    mockState.appSettings = {};
    mockSetAppSettings.mockClear();
  });

  it('renders the permit form when no saved permit exists', () => {
    const { getByText } = render(<PermitScreen />);
    expect(getByText('Permit_Save')).toBeTruthy();
    expect(getByText('School_Bus_Permit_Name')).toBeTruthy();
  });

  it('does not save when required fields are empty', () => {
    const { getByText } = render(<PermitScreen />);
    fireEvent.press(getByText('Permit_Save'));
    expect(mockSetAppSettings).not.toHaveBeenCalled();
  });

  it('renders both permit variants when saved data exists', () => {
    mockState.appSettings = {
      schoolBusPermit: { name: 'Ada', sid: '1155', major: 'CSCI', expiry: '06/2026' },
    };
    const { getByText } = render(<PermitScreen />);
    expect(getByText('Shuttle Bus Permit')).toBeTruthy();
    expect(getByText('Meet-Class Bus Permit')).toBeTruthy();
    expect(getByText('穿梭校巴證')).toBeTruthy();
    expect(getByText('轉堂校巴證')).toBeTruthy();
  });

  it('opens and closes the fullscreen permit viewer', () => {
    mockState.appSettings = {
      schoolBusPermit: { name: 'Ada', sid: '1155', major: 'CSCI', expiry: '06/2026' },
    };
    const { getByTestId, getByText, queryByTestId } = render(<PermitScreen />);

    fireEvent.press(getByTestId('permit-card-shuttle'));
    expect(getByTestId('permit-card-fullscreen')).toBeTruthy();
    expect(getByText('Permit_Close')).toBeTruthy();

    fireEvent.press(getByText('Permit_Close'));
    expect(queryByTestId('permit-card-fullscreen')).toBeNull();
  });
});
