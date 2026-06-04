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
});
