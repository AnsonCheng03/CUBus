import React from 'react';
import { act } from 'react';
import { Animated } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
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

jest.mock('../../components/permit/PermitFullscreenModal', () => {
  const React = require('react');
  const { Pressable, View } = require('react-native');

  return {
    PermitFullscreenModal: ({
      visibleBusMode,
      onClose,
    }: {
      visibleBusMode: string | null;
      onClose: () => void;
    }) =>
      visibleBusMode ? (
        <View testID="permit-card-fullscreen">
          <Pressable testID="permit-fullscreen-backdrop" onPress={onClose} />
        </View>
      ) : null,
  };
});

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

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('PermitScreen', () => {
  let timingSpy: jest.SpyInstance;

  beforeEach(() => {
    mockState.appSettings = {};
    mockSetAppSettings.mockClear();
    timingSpy = jest.spyOn(Animated, 'timing').mockImplementation(
      (value: Animated.Value | Animated.ValueXY, config: Animated.TimingAnimationConfig) =>
        ({
          start: (callback?: Animated.EndCallback) => {
            if (value instanceof Animated.Value && typeof config.toValue === 'number') {
              value.setValue(config.toValue);
            }
            callback?.({ finished: true });
          },
          stop: jest.fn(),
          reset: jest.fn(),
        }) as Animated.CompositeAnimation,
    );
  });

  afterEach(() => {
    timingSpy.mockRestore();
  });

  it('renders the permit form when no saved permit exists', async () => {
    const { getByText } = await render(<PermitScreen />);
    expect(getByText('Permit_Save')).toBeTruthy();
    expect(getByText('School_Bus_Permit_Name')).toBeTruthy();
  });

  it('does not save when required fields are empty', async () => {
    const { getByText } = await render(<PermitScreen />);
    await act(async () => {
      fireEvent.press(getByText('Permit_Save'));
    });
    expect(mockSetAppSettings).not.toHaveBeenCalled();
  });

  it('renders both permit variants when saved data exists', async () => {
    mockState.appSettings = {
      schoolBusPermit: { name: 'Ada', sid: '1155', major: 'CSCI', expiry: '06/2026' },
    };
    const { getAllByText } = await render(<PermitScreen />);
    expect(getAllByText('Shuttle Bus Permit').length).toBeGreaterThan(0);
    expect(getAllByText('Meet-Class Bus Permit').length).toBeGreaterThan(0);
    expect(getAllByText('穿梭校巴證').length).toBeGreaterThan(0);
    expect(getAllByText('轉堂校巴證').length).toBeGreaterThan(0);
  });

  it('opens and closes the fullscreen permit viewer', async () => {
    mockState.appSettings = {
      schoolBusPermit: { name: 'Ada', sid: '1155', major: 'CSCI', expiry: '06/2026' },
    };
    const { getByTestId, queryByTestId } = await render(<PermitScreen />);

    await act(async () => {
      fireEvent(getByTestId('permit-card-shuttle'), 'onPress');
    });
    await waitFor(() => expect(getByTestId('permit-card-fullscreen')).toBeTruthy());

    await act(async () => {
      fireEvent.press(getByTestId('permit-fullscreen-backdrop'));
    });
    await waitFor(() => expect(queryByTestId('permit-card-fullscreen')).toBeNull());
  });
});
