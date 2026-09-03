import React from 'react';
import { render } from '@testing-library/react-native';
import { AppStatusScreen } from '../AppStatusScreen';

describe('AppStatusScreen', () => {
  it('shows the animated loading progress bar while loading', async () => {
    const { getByTestId } = await render(
      <AppStatusScreen title="CU Bus" hint="Loading" loading />,
    );

    expect(getByTestId('loading-progress-track')).toBeTruthy();
  });
});
