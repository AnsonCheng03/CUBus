import React from 'react';
import { act } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { NoticeBanner } from '../NoticeBanner';

jest.mock('expo-router', () => ({
  usePathname: () => '/',
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string) => key,
  }),
}));

describe('NoticeBanner', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('honors non-dismissible notices', async () => {
    const { getByText, queryByText } = await render(
      <NoticeBanner
        notice={[
          {
            id: 1,
            content: ['中文', 'Important notice'],
            pref: { dismissible: false, type: 'danger' },
          },
        ]}
      />,
    );

    expect(getByText('Important notice')).toBeTruthy();
    expect(queryByText('toast_dismiss')).toBeNull();
  });

  it('auto-dismisses a notice after its configured duration', async () => {
    jest.useFakeTimers();
    const { getByText, queryByText } = await render(
      <NoticeBanner
        notice={[
          { id: 1, content: ['較早', 'Earlier notice'], pref: {} },
          { id: 2, content: ['最新', 'Latest notice'], pref: { duration: 100 } },
        ]}
      />,
    );

    expect(getByText('Latest notice')).toBeTruthy();
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    expect(queryByText('Latest notice')).toBeNull();
    expect(getByText('Earlier notice')).toBeTruthy();
  });

  it('allows a dismissible notice to advance to the next notice', async () => {
    const { getByText, queryByText } = await render(
      <NoticeBanner
        notice={[
          { id: 1, content: ['較早', 'Earlier notice'], pref: {} },
          { id: 2, content: ['最新', 'Latest notice'], pref: { dismissible: true } },
        ]}
      />,
    );

    await act(async () => {
      fireEvent.press(getByText('toast_dismiss'));
    });
    await waitFor(() => expect(queryByText('Latest notice')).toBeNull());
    expect(getByText('Earlier notice')).toBeTruthy();
  });
});
