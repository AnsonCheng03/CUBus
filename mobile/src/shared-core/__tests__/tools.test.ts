import { getTextColor } from '../utils/tools';

describe('getTextColor', () => {
  it('uses dark text for bright backgrounds', () => {
    expect(getTextColor('rgb(255, 240, 180)')).toBe('#000000');
  });

  it('uses light text for dark backgrounds', () => {
    expect(getTextColor('rgb(15, 118, 110)')).toBe('#ffffff');
  });
});
