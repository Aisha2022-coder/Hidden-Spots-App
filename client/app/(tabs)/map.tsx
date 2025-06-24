import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { getNearbySpots } from '../../utils/api';
import { router, useLocalSearchParams } from 'expo-router';

const GWALIOR_COORDS = { latitude: 26.2183, longitude: 78.1828 };
const DEFAULT_DELTA = { latitudeDelta: 0.08, longitudeDelta: 0.08 };

type Spot = {
  _id: string;
  name: string;
  vibe: keyof typeof vibeEmojis;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
};

const vibeEmojis = {
  Romantic: '💕',
  Serene: '🌊',
  Creative: '🎨',
  Other: '📍',
};

export default function MapScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const params = useLocalSearchParams();
  const paramsString = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    setErrorMsg('');
    const fetchSpots = async () => {
      try {
        const filters = {
          lat: GWALIOR_COORDS.latitude,
          lng: GWALIOR_COORDS.longitude,
          radius: params.radius ? Number(params.radius) : 10,
          vibe: params.vibe || undefined,
          safety: params.safety ? Number(params.safety) : undefined,
          crowd: params.crowd ? Number(params.crowd) : undefined,
          keyword: params.keyword || undefined,
        };
        const data = await getNearbySpots(filters);
        setSpots(data);
      } catch (e) {
        setErrorMsg('Failed to fetch spots');
      }
      setLoading(false);
    };
    fetchSpots();
  }, [paramsString]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (errorMsg) {
    return <View style={styles.center}><Text>{errorMsg}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: GWALIOR_COORDS.latitude,
          longitude: GWALIOR_COORDS.longitude,
          ...DEFAULT_DELTA,
        }}
        showsUserLocation
      >
        {spots.map(spot => (
          <Marker
            key={spot._id}
            coordinate={{
              latitude: spot.coordinates?.coordinates[1] || GWALIOR_COORDS.latitude,
              longitude: spot.coordinates?.coordinates[0] || GWALIOR_COORDS.longitude,
            }}
            title={spot.name}
            description={spot.vibe}
            onPress={() => router.push(`/spot/${spot._id}`)}
          >
            <Text style={{ fontSize: 28 }}>{vibeEmojis[spot.vibe] || vibeEmojis.Other}</Text>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 