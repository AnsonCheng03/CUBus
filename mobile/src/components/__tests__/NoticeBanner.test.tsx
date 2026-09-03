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

  it('does not render notices marked as hidden by legacy or backend values', async () => {
    const { getByText, queryByText } = await render(
      <NoticeBanner
        notice={[
          { id: 1, content: ['中文', 'Numeric hidden'], pref: { hide: 1 } },
          { id: 2, content: ['中文', 'Boolean hidden'], pref: { hide: true } },
          { id: 3, content: ['中文', 'PHP string hidden'], pref: { hide: '1' } },
          { id: 4, content: ['中文', 'Backend string hidden'], pref: { hide: 'true' } },
          { id: 5, content: ['中文', 'Visible notice'], pref: { hide: 0 } },
        ]}
      />,
    );

    expect(queryByText('Numeric hidden')).toBeNull();
    expect(queryByText('Boolean hidden')).toBeNull();
    expect(queryByText('PHP string hidden')).toBeNull();
    expect(queryByText('Backend string hidden')).toBeNull();
    expect(getByText('Visible notice')).toBeTruthy();
  });

  it('renders escaped and actual newlines as line breaks', async () => {
    const { getByText } = await render(
      <NoticeBanner
        notice={[
          {
            id: 1,
            content: ['中文', 'First\\nSecond\nThird'],
            pref: {},
          },
        ]}
      />,
    );

    expect(getByText('First\nSecond\nThird')).toBeTruthy();
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
