import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';

const campusMapImage = require('../../../src/assets/schoolbusmap.svg');
const MAP_WIDTH = 1260;
const MAP_HEIGHT = 1260 * (595.28 / 841.89);
const MAP_PADDING = 200;
const INITIAL_SCROLL_X = 380;
const INITIAL_SCROLL_Y = 340;

function buildSvgHtml(svgText: string) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=5, minimum-scale=1, user-scalable=yes, viewport-fit=cover"
    />
    <style>
      :root {
        color-scheme: light;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #f5f1ed;
        overflow: auto;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-x pan-y pinch-zoom;
      }

      body {
        min-width: ${MAP_WIDTH + MAP_PADDING * 2}px;
        min-height: ${MAP_HEIGHT + MAP_PADDING * 2}px;
      }

      #canvas {
        width: ${MAP_WIDTH}px;
        height: ${MAP_HEIGHT}px;
        margin: ${MAP_PADDING}px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        transform-origin: top center;
      }

      #canvas svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    </style>
  </head>
  <body>
    <div id="canvas">${svgText}</div>
    <script>
      (function() {
        var initialX = ${INITIAL_SCROLL_X};
        var initialY = ${INITIAL_SCROLL_Y};

        function applyInitialViewport() {
          window.scrollTo(initialX, initialY);
        }

        window.addEventListener('load', function() {
          requestAnimationFrame(function() {
            applyInitialViewport();
            setTimeout(applyInitialViewport, 60);
          });
        });
      })();
    </script>
  </body>
</html>`;
}

export function BusMapModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation('global');
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const [rawMapSvg, setRawMapSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Asset.loadAsync(campusMapImage)
      .then(([asset]) => {
        const uri = asset.localUri ?? asset.uri;
        return fetch(uri).then((response) => response.text());
      })
      .then((svgText) => {
        if (!cancelled) {
          setRawMapSvg(svgText);
        }
      })
      .catch((error) => {
        console.warn('[bus-map] unable to load bus map svg', error);
        if (!cancelled) {
          setRawMapSvg(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const mapHtml = useMemo(() => (rawMapSvg ? buildSvgHtml(rawMapSvg) : null), [rawMapSvg]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t('bus_map_page')}</Text>
            <Text style={styles.subtitle}>{t('modal-map-title')}</Text>
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>{t('toast_dismiss')}</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.mapCard}>
            {mapHtml ? (
              <WebView
                key={visible ? 'open' : 'closed'}
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                style={styles.webview}
                containerStyle={styles.webviewContainer}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled
                bounces={false}
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                scalesPageToFit={false}
                setBuiltInZoomControls
                setDisplayZoomControls={false}
              />
            ) : (
              <View style={styles.loadingState}>
                <Text style={styles.loadingText}>{t('loading')}</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1ed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#7a6c66',
  },
  close: {
    color: '#630a10',
    fontWeight: '700',
    paddingTop: 4,
  },
  content: {
    flex: 1,
  },
  mapCard: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#f5f1ed',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#f5f1ed',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f5f1ed',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: '#7a6c66',
  },
});
