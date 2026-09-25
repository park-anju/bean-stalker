import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { SearchCenter, Cafe } from '@bean-stalker/contracts';

import { Colors } from '@/constants/theme';
import { getCafeMarkerData, getMapCoordinates } from './mapData';
import { buildInitialMapRegion } from './mapRegion';

type CafeMapProps = {
  center: SearchCenter;
  cafes: Cafe[];
  selectedCafeId: string | null;
  onSelectCafe: (cafeId: string) => void;
};

const FIT_EDGE_PADDING = { top: 48, right: 32, bottom: 48, left: 32 };
const CURRENT_LOCATION_COLOR = '#2F80ED';
const CAFE_MARKER_COLOR = '#8A4B2A';
const SELECTED_MARKER_COLOR = '#C46B32';

export default function CafeMap({ center, cafes, selectedCafeId, onSelectCafe }: CafeMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const markers = useMemo(() => getCafeMarkerData(cafes), [cafes]);
  const mapDataKey = [
    center.latitude,
    center.longitude,
    ...markers.map((marker) => marker.id),
  ].join('|');
  const initialRegion = useMemo(
    () => buildInitialMapRegion(getMapCoordinates(center, cafes)),
    [center, cafes],
  );

  useEffect(() => {
    const selectedMarker = markers.find((marker) => marker.id === selectedCafeId);
    if (!selectedMarker) return;

    mapRef.current?.animateToRegion(
      {
        ...selectedMarker.coordinate,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      350,
    );
  }, [markers, selectedCafeId]);

  function fitInitialCoordinates() {
    const coordinates = getMapCoordinates(center, cafes);
    if (coordinates.length < 2) return;
    mapRef.current?.fitToCoordinates(coordinates, {
      edgePadding: FIT_EDGE_PADDING,
      animated: false,
    });
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}
      importantForAccessibility="no"
    >
      <MapView
        key={mapDataKey}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={fitInitialCoordinates}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}
        loadingEnabled
      >
        <Marker
          coordinate={center}
          title="Your current location"
          description="Current verified location"
          pinColor={CURRENT_LOCATION_COLOR}
          accessibilityLabel="Your current location"
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            identifier={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description="Nearby café"
            pinColor={marker.id === selectedCafeId ? SELECTED_MARKER_COLOR : CAFE_MARKER_COLOR}
            accessibilityLabel={marker.title}
            onPress={() => onSelectCafe(marker.id)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 18,
  },
  map: {
    flex: 1,
  },
});
