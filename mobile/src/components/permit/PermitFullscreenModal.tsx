import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { PermitCard, PERMIT_CARD_RATIO } from '../PermitCard';
import { permitBusRoutes } from '../../lib/permit';
import type { PermitFormValue } from '../../types/mobile';
import { e2eProps } from '../../test-support/e2eProps';

export function PermitFullscreenModal({
  visibleBusMode,
  permit,
  fullscreenCardWidth,
  isPortrait,
  onClose,
}: {
  visibleBusMode: keyof typeof permitBusRoutes | null;
  permit: PermitFormValue;
  fullscreenCardWidth: number;
  isPortrait: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visibleBusMode !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          {...e2eProps('permit-fullscreen-backdrop')}
          style={styles.modalFullscreenTap}
          onPress={onClose}
        >
          <View
            style={[
              styles.modalCardFrame,
              isPortrait && {
                width: fullscreenCardWidth / PERMIT_CARD_RATIO,
                height: fullscreenCardWidth,
              },
            ]}
          >
            {visibleBusMode ? (
              <View style={isPortrait ? { transform: [{ rotate: '90deg' }] } : null}>
                <PermitCard
                  permit={permit}
                  busMode={visibleBusMode}
                  targetWidth={fullscreenCardWidth}
                  withShadow={false}
                  testID="permit-card-fullscreen"
                />
              </View>
            ) : null}
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(240, 240, 240, 0.95)',
  },
  modalFullscreenTap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCardFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
