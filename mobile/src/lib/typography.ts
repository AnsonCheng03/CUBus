import { Platform, Text, TextInput } from 'react-native';

export const APP_FONT_FAMILY_SANS = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const APP_FONT_WEIGHT_REGULAR = '400';
export const APP_FONT_WEIGHT_MEDIUM = Platform.select({
  ios: '600',
  android: '500',
  default: '500',
});
export const APP_FONT_WEIGHT_BOLD = '700';
export const APP_FONT_WEIGHT_HEAVY = '800';

let typographyDefaultsApplied = false;

function withDefaultStyle(existingStyle: unknown, defaultStyle: { fontFamily: string }) {
  if (!existingStyle) {
    return defaultStyle;
  }

  return [defaultStyle, existingStyle];
}

export function applyGlobalTypographyDefaults() {
  if (typographyDefaultsApplied) {
    return;
  }

  typographyDefaultsApplied = true;

  const defaultTextStyle = { fontFamily: APP_FONT_FAMILY_SANS };
  const TextWithDefaults = Text as typeof Text & { defaultProps?: { style?: unknown } };
  const TextInputWithDefaults = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };

  TextWithDefaults.defaultProps = {
    ...(TextWithDefaults.defaultProps ?? {}),
    style: withDefaultStyle(TextWithDefaults.defaultProps?.style, defaultTextStyle),
  };

  TextInputWithDefaults.defaultProps = {
    ...(TextInputWithDefaults.defaultProps ?? {}),
    style: withDefaultStyle(TextInputWithDefaults.defaultProps?.style, defaultTextStyle),
  };
}
