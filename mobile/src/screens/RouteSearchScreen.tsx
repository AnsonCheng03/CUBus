import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteMapSelection } from '../shared-core/app/types';
import { RouteMapModal } from '../components/RouteMapModal';
import { RouteSearchFormCard } from '../components/route-search/RouteSearchFormCard';
import { RouteSearchResultsList } from '../components/route-search/RouteSearchResultsList';
import { ScreenContainer } from '../components/ScreenContainer';
import { InlineNoticeRow } from '../components/InlineNoticeRow';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import {
  formatTranslatedStationLabel,
  resolveNearestStationCodeFromCoordinates,
} from '../hooks/useNearestStation';
import { useRouteCompute } from '../hooks/useRouteCompute';
import { createRouteSearchRouteMapSelection } from '../hooks/useRouteMapSelection';
import { useRouteSearchState } from '../hooks/useRouteSearchState';
import { getCurrentCoordinates } from '../lib/location';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import { useAppState } from '../providers/AppProvider';
import { e2eProps } from '../test-support/e2eProps';

export function RouteSearchScreen() {
  const { t } = useTranslation('global');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;
  const { appData, networkError, refreshRealtime } = useAppState();
  const state = useRouteSearchState();
  const { routeResult, routeMap, setRouteMap, fetchError, generate } = useRouteCompute();
  const [refreshing, setRefreshing] = useState(false);
  const [pageHeight, setPageHeight] = useState(0);
  const [formHeight, setFormHeight] = useState(0);
  const [gpsErrorText, setGpsErrorText] = useState<string | null>(null);
  const [floatingGpsNoticeText, setFloatingGpsNoticeText] = useState<string | null>(null);
  const searchLayoutProgress = useRef(
    new Animated.Value(appTempIsEmpty(state.routeSearchStart, state.routeSearchDest) ? 0 : 1),
  ).current;
  const floatingNoticeProgress = useRef(new Animated.Value(0)).current;

  const onSubmit = () =>
    generate({
      routeSearchStart: state.routeSearchStart,
      routeSearchDest: state.routeSearchDest,
      departNow: state.departNow,
      selectWeekday: state.selectWeekday,
      selectDate: state.selectDate,
      selectHour: state.selectHour,
      selectMinute: state.selectMinute,
    });

  useEffect(() => {
    state.persistTemp();
    onSubmit();
  }, [
    state.routeSearchStart,
    state.routeSearchDest,
    state.departNow,
    state.selectWeekday,
    state.selectDate,
    state.selectHour,
    state.selectMinute,
  ]);

  useEffect(() => {
    if (gpsErrorText !== t('nearst_error')) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setGpsErrorText((current) => (current === t('nearst_error') ? null : current));
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [gpsErrorText, t]);

  const applyNearestTo = async (field: 'start' | 'dest') => {
    setGpsErrorText(null);
    const nearestStation = await getCurrentCoordinates(t)
      .then((coords) => {
        return resolveNearestStationCodeFromCoordinates(t, appData.GPS ?? {}, coords);
      })
      .catch((error: unknown) => {
        setGpsErrorText(error instanceof Error ? error.message : t('GPS-error'));
        return null;
      });

    if (!nearestStation) {
      setGpsErrorText((current) => current ?? t('GPS-error'));
      return;
    }

    const nextValue = formatTranslatedStationLabel(t, nearestStation);
    if (field === 'start') {
      state.setRouteSearchStart(nextValue);
      return;
    }

    state.setRouteSearchDest(nextValue);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealtime();
    await onSubmit();
    setRefreshing(false);
  };

  const routeMapSelection: RouteMapSelection | null = routeMap;
  const routeError = routeResult ? ('error' in routeResult ? routeResult : null) : null;
  const routeSuccess = routeResult ? ('sortedResults' in routeResult ? routeResult : null) : null;
  const isEmptySearch = appTempIsEmpty(state.routeSearchStart, state.routeSearchDest);
  const shouldShowFloatingGpsNotice = isEmptySearch && !!gpsErrorText;
  const dockedTop = (isLargeScreen ? 0 : insets.top) + 15;
  const searchSectionDockedHeight = Math.max(dockedTop + formHeight + 50, 0);
  const resultsVisibleHeight = Math.max(pageHeight - searchSectionDockedHeight + 25, 0);
  const centeredTop = Math.max((pageHeight - formHeight) / 2, 0);

  useEffect(() => {
    Animated.timing(searchLayoutProgress, {
      toValue: isEmptySearch ? 0 : 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isEmptySearch, searchLayoutProgress]);

  useEffect(() => {
    if (shouldShowFloatingGpsNotice) {
      setFloatingGpsNoticeText(gpsErrorText);
      Animated.timing(floatingNoticeProgress, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(floatingNoticeProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setFloatingGpsNoticeText(null);
      }
    });
  }, [floatingNoticeProgress, gpsErrorText, shouldShowFloatingGpsNotice]);

  const formTranslateY = searchLayoutProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, dockedTop - centeredTop],
  });
  const searchSectionHeight = searchLayoutProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [pageHeight, searchSectionDockedHeight],
  });
  const resultsTranslateY = searchLayoutProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });
  const resultsHeight = searchLayoutProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, resultsVisibleHeight],
  });

  const onPageLayout = (event: LayoutChangeEvent) => {
    setPageHeight(event.nativeEvent.layout.height);
  };

  const onFormLayout = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;
    setFormHeight((current) => (Math.abs(current - nextHeight) < 1 ? current : nextHeight));
  };

  return (
    <ScreenContainer
      title={t('title_routesearch')}
      subtitle={t('meta_desc_routesearch')}
      showHeader={false}
      scrollable={false}
      contentPadding={0}
      contentGap={0}
      contentStyle={[
        styles.pageContent,
        !isLargeScreen && { paddingBottom: 0 },
      ]}
      scrollStyle={styles.scroll}
      safeAreaBackgroundColor="#911f27"
      safeAreaEdges={[]}
    >
      <RouteMapModal routeMap={routeMapSelection} onClose={() => setRouteMap(null)} />

      <View {...e2eProps('route-search-screen')} style={styles.pageFrame} onLayout={onPageLayout}>
        {floatingGpsNoticeText ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.floatingNoticeShell,
              {
                opacity: floatingNoticeProgress,
                transform: [
                  {
                    translateY: floatingNoticeProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <InlineNoticeRow text={floatingGpsNoticeText} variant="alert" />
          </Animated.View>
        ) : null}

        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.searchSection,
            {
              height: searchSectionHeight,
            },
          ]}
        >
          <View pointerEvents="none" style={styles.searchSectionBackdrop} />
          <Animated.View
            onLayout={onFormLayout}
            style={[
              styles.formAnimatedShell,
              {
                top: centeredTop,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            <RouteSearchFormCard
              startValue={state.routeSearchStart}
              destValue={state.routeSearchDest}
              options={state.translatedBuildings}
              onChangeStart={state.setRouteSearchStart}
              onChangeDest={state.setRouteSearchDest}
              onUseNearbyStart={() => {
                applyNearestTo('start').catch(() => {});
              }}
              onUseNearbyDest={() => {
                applyNearestTo('dest').catch(() => {});
              }}
              departNow={state.departNow}
              onToggleDepartNow={state.setDepartNow}
              timeValues={{
                weekday: state.selectWeekday,
                date: state.selectDate,
                hour: state.selectHour,
                minute: state.selectMinute,
              }}
              travelDateOptions={state.travelDateOptions}
              onChangeWeekday={state.setSelectWeekday}
              onChangeDate={state.setSelectDate}
              onChangeHour={state.setSelectHour}
              onChangeMinute={state.setSelectMinute}
              t={t}
            />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.resultsSection,
            {
              height: resultsHeight,
              transform: [{ translateY: resultsTranslateY }],
            },
          ]}
        >
          <ScrollView
            pointerEvents={isEmptySearch ? 'none' : 'auto'}
            style={styles.resultsScroll}
            contentContainerStyle={[
              styles.resultsSectionContent,
              !isLargeScreen && { paddingBottom: 24 + MOBILE_BOTTOM_NAV_OVERLAP },
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />
            }
          >
            <RouteSearchResultsList
              results={routeSuccess?.sortedResults}
              routeError={routeError?.error}
              routeMessage={routeError?.message}
              fetchError={fetchError}
              gpsErrorText={isEmptySearch ? null : gpsErrorText}
              networkError={networkError.realtime}
              sameStation={routeSuccess?.samestation ?? false}
              onSelect={(result) => {
                setRouteMap(createRouteSearchRouteMapSelection(result, appData.token));
              }}
              t={t}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

function appTempIsEmpty(start: string, dest: string) {
  return start.trim() === '' && dest.trim() === '';
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#911f27',
  },
  pageContent: {
    flex: 1,
    backgroundColor: '#911f27',
  },
  pageFrame: {
    flex: 1,
  },
  floatingNoticeShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12 + MOBILE_BOTTOM_NAV_OVERLAP,
    zIndex: 40,
    elevation: 40,
  },
  searchSection: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 20,
    elevation: 20,
  },
  searchSectionBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 25,
    backgroundColor: '#911f27',
  },
  formAnimatedShell: {
    position: 'absolute',
    left: '3%',
    right: '3%',
    zIndex: 30,
    elevation: 30,
  },
  resultsSection: {
    marginTop: -25,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#faf8f6',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
  },
  resultsScroll: {
    flex: 1,
  },
  resultsSectionContent: {
    paddingTop: 18,
    paddingBottom: 16,
  },
});
