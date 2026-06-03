import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { PermitScreen } from '../PermitScreen';

const mockSetAppSettings = jest.fn();

jest.mock('../../providers/AppProvider', () => ({
  useAppState: () => ({
    appSettings: {},
    setAppSettings: mockSetAppSettings,
  }),
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

jest.mock('../../components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PermitScreen', () => {
  it('renders the permit form when no saved permit exists', () => {
    const { getByText } = render(<PermitScreen />);
    expect(getByText('Permit_Save')).toBeTruthy();
    expect(getByText('School_Bus_Permit_Name')).toBeTruthy();
  });

  it('allows entering permit content before save', () => {
    const { getByText } = render(<PermitScreen />);
    const saveButton = getByText('Permit_Save');
    fireEvent.press(saveButton);
    expect(mockSetAppSettings).not.toHaveBeenCalled();
  });
});
