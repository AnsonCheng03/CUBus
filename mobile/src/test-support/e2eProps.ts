export function e2eProps(id?: string) {
  if (!id) {
    return {};
  }

  return {
    testID: id,
    accessibilityLabel: id,
  };
}
