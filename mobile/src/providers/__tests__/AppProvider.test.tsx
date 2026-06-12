import React from 'react';
import { act } from 'react';
import { Pressable, Text } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AppProvider, useAppState } from '../AppProvider';

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockClearAll = jest.fn();
const mockInvalidateQueries = jest.fn();
const mockRemoveQueries = jest.fn();
const mockBootstrapRefetch = jest.fn().mockResolvedValue(undefined);
const mockRealtimeRefetch = jest.fn().mockResolvedValue(undefined);
const mockDeltaRefetch = jest.fn().mockResolvedValue(undefined);

const mockBootstrapQuery = jest.fn();
const mockRealtimeQuery = jest.fn();
const mockDeltaSyncQuery = jest.fn();
const mockDelayedActivation = jest.fn();

jest.mock('../../lib/storage', () => ({
  asyncStorageStore: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
    clearAll: (...args: unknown[]) => mockClearAll(...args),
  },
}));

jest.mock('../../query/hooks', () => ({
  useBootstrapDataQuery: () => mockBootstrapQuery(),
  useRealtimeDataQuery: () => mockRealtimeQuery(),
  useDeltaSyncQuery: () => mockDeltaSyncQuery(),
  useDelayedActivation: (...args: unknown[]) => mockDelayedActivation(...args),
}));

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
      removeQueries: (...args: unknown[]) => mockRemoveQueries(...args),
    }),
  };
});

function Consumer() {
  const { bootStatus, missingData, resetApp, retryBoot, syncDelta, refreshRealtime } = useAppState();
  return (
    <>
      <Text>{bootStatus}</Text>
      <Text>{missingData.join(',')}</Text>
      <Pressable onPress={() => resetApp().catch(() => {})}>
        <Text>reset</Text>
      </Pressable>
      <Pressable onPress={() => retryBoot().catch(() => {})}>
        <Text>retry</Text>
      </Pressable>
      <Pressable onPress={() => syncDelta().catch(() => {})}>
        <Text>sync</Text>
      </Pressable>
      <Pressable onPress={() => refreshRealtime().catch(() => {})}>
        <Text>refresh</Text>
      </Pressable>
    </>
  );
}

function renderWithQueryProvider(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      {ui}
    </QueryClientProvider>,
  );
}

describe('AppProvider', () => {
  beforeEach(() => {
    mockGet.mockImplementation(async (key: string) => (key === 'appSettings' ? null : null));
    mockSet.mockResolvedValue(undefined);
    mockClearAll.mockResolvedValue(undefined);
    mockInvalidateQueries.mockClear();
    mockRemoveQueries.mockClear();
    mockBootstrapRefetch.mockClear();
    mockRealtimeRefetch.mockClear();
    mockDeltaRefetch.mockClear();
    mockDelayedActivation.mockReturnValue(true);

    mockBootstrapQuery.mockReturnValue({
      data: {
        appData: {
          'timetable.json': {},
          bus: {},
          notice: [],
          station: {},
          GPS: {},
          WebsiteLinks: [],
        },
      },
      isPending: false,
      isError: false,
      refetch: mockBootstrapRefetch,
    });

    mockRealtimeQuery.mockReturnValue({
      data: {},
      isError: false,
      refetch: mockRealtimeRefetch,
    });

    mockDeltaSyncQuery.mockReturnValue({
      data: { batchError: false },
      isError: false,
      fetchStatus: 'idle',
      refetch: mockDeltaRefetch,
    });
  });

  it('initializes successfully into ready state', async () => {
    const { getByText } = await renderWithQueryProvider(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('ready')).toBeTruthy());
  });

  it('shows corrupted state when required data is missing', async () => {
    mockBootstrapQuery.mockReturnValue({
      data: { appData: {} },
      isPending: false,
      isError: false,
      refetch: mockBootstrapRefetch,
    });

    const { getByText } = await renderWithQueryProvider(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('corrupted')).toBeTruthy());
    expect(getByText(/timetable\.json/)).toBeTruthy();
  });

  it('shows recoverable error when bootstrap query fails', async () => {
    mockBootstrapQuery.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mockBootstrapRefetch,
    });

    const { getByText } = await renderWithQueryProvider(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await waitFor(() => expect(getByText('recoverable-error')).toBeTruthy());
  });

  it('reset clears storage and query caches before refetching bootstrap', async () => {
    const { getByText } = await renderWithQueryProvider(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await act(async () => {
      fireEvent.press(getByText('reset'));
    });

    await waitFor(() => expect(mockClearAll).toHaveBeenCalled());
    expect(mockRemoveQueries).toHaveBeenCalledTimes(3);
    expect(mockBootstrapRefetch).toHaveBeenCalled();
  });

  it('retry and refresh actions refetch the expected query owners', async () => {
    const { getByText } = await renderWithQueryProvider(
      <AppProvider>
        <Consumer />
      </AppProvider>,
    );

    await act(async () => {
      fireEvent.press(getByText('retry'));
    });
    await act(async () => {
      fireEvent.press(getByText('sync'));
    });
    await act(async () => {
      fireEvent.press(getByText('refresh'));
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalled());
    expect(mockBootstrapRefetch).toHaveBeenCalled();
    expect(mockDeltaRefetch).toHaveBeenCalled();
    expect(mockRealtimeRefetch).toHaveBeenCalled();
  });
});
