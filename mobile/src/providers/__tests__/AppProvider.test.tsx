import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProvider, useAppState } from '../AppProvider';

const mockCreateRepository = jest.fn();
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockClearAll = jest.fn();
const mockRemove = jest.fn();

jest.mock('../../../../src/shared-core/data/repository', () => ({
  createRepository: (...args: unknown[]) => mockCreateRepository(...args),
}));

jest.mock('../../lib/storage', () => ({
  asyncStorageStore: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
    clearAll: (...args: unknown[]) => mockClearAll(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
  },
}));

jest.mock('../../lib/nativeApi', () => ({
  nativeApiClient: {},
}));

jest.mock('../../lib/i18n', () => ({
  i18next: {
    t: (key: string) => key,
    addResourceBundle: jest.fn(),
  },
}));

function Consumer() {
  const { bootStatus, missingData, resetApp } = useAppState();
  return (
    <>
      <Text>{bootStatus}</Text>
      <Text>{missingData.join(',')}</Text>
      <Pressable onPress={() => resetApp().catch(() => {})}>
        <Text>reset</Text>
      </Pressable>
    </>
  );
}

function buildRepository(options: { fillRequiredData?: boolean; failInit?: boolean } = {}) {
  return {
    async initAndWarm() {
      if (options.failInit) {
        throw new Error('boot failed');
      }
      if (options.fillRequiredData) {
        const deps = mockCreateRepository.mock.calls[mockCreateRepository.mock.calls.length - 1][0];
        deps.setAppData((prev: Record<string, unknown>) => ({
          ...prev,
          'timetable.json': {},
          bus: {},
          notice: [],
          station: {},
          GPS: {},
          WebsiteLinks: [],
        }));
      }
      return null;
    },
    async realtimeOnce() {
      return {};
    },
    async syncDelta() {
      return null;
    },
  };
}

describe('AppProvider', () => {
  beforeEach(() => {
    mockGet.mockImplementation(async (key: string) => {
      if (key === 'appSettings') return null;
      return null;
    });
    mockSet.mockResolvedValue(undefined);
    mockClearAll.mockResolvedValue(undefined);
    mockRemove.mockResolvedValue(undefined);
    mockCreateRepository.mockReset();
  });

  it('initializes successfully into ready state', async () => {
    mockCreateRepository.mockImplementation(() => buildRepository({ fillRequiredData: true }));
    const { getByText } = render(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('ready')).toBeTruthy());
  });

  it('shows corrupted state when required data is missing', async () => {
    mockCreateRepository.mockImplementation(() => buildRepository());
    const { getByText } = render(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('corrupted')).toBeTruthy());
    expect(getByText(/timetable\.json/)).toBeTruthy();
  });

  it('shows recoverable error when boot fails', async () => {
    mockCreateRepository.mockImplementation(() => buildRepository({ failInit: true }));
    const { getByText } = render(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('recoverable-error')).toBeTruthy());
  });

  it('reset path clears storage and boots again', async () => {
    mockCreateRepository.mockImplementation(() => buildRepository({ fillRequiredData: true }));
    const { getByText } = render(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('ready')).toBeTruthy());
    fireEvent.press(getByText('reset'));

    await waitFor(() => expect(mockClearAll).toHaveBeenCalled());
    await waitFor(() => expect(mockCreateRepository).toHaveBeenCalledTimes(2));
  });
});
