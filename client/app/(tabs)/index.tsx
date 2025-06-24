import React, { useState, useEffect, useCallback } from 'react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getNearbySpots } from '../../utils/api';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

const GWALIOR_COORDS = {
  latitude: 26.2183,
  longitude: 78.1828,
};

export default function MapScreen() {
  type Spot = {
    _id: string;
    name: string;
    vibe: string;
    coordinates: {
      coordinates: [number, number];
    };
  };

  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [tracksChanges, setTracksChanges] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const params = useLocalSearchParams();
  const stringifiedParams = JSON.stringify(params);

  const [activeFilters, setActiveFilters] = useState({
    radius: '10000',
    vibe: '',
    safety: '',
    crowd: '',
    keyword: ''
  });
  
  const [mapPageInputs, setMapPageInputs] = useState({
    radius: '10000',
    vibe: '',
    safety: '',
    crowd: '',
    keyword: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
      } catch (e) {
        console.error("Could not get location", e);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const parsedParams = JSON.parse(stringifiedParams);
      
      const filtersFromParams = {
        radius: parsedParams.radius?.toString() || '10000',
        vibe: parsedParams.vibe?.toString() || '',
        safety: parsedParams.safety?.toString() || '',
        crowd: parsedParams.crowd?.toString() || '',
        keyword: parsedParams.keyword?.toString() || '',
      };
      
      setActiveFilters(prevFilters => {
        if (JSON.stringify(filtersFromParams) !== JSON.stringify(prevFilters)) {
          setMapPageInputs(filtersFromParams); 
          return filtersFromParams;
        }
        return prevFilters;
      });
      
    }, [stringifiedParams])
  );

  const fetchSpots = async () => {
    setLoading(true);
    const queryParams: any = {
      lat: GWALIOR_COORDS.latitude,
      lng: GWALIOR_COORDS.longitude,
      radius: activeFilters.radius || undefined,
      vibe: activeFilters.vibe || undefined,
      keyword: activeFilters.keyword || undefined,
      safety: activeFilters.safety || undefined,
      crowd: activeFilters.crowd || undefined,
    };
    const data = await getNearbySpots(queryParams);
    setSpots(data);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSpots();
    }, [activeFilters])
  );

  const handleMapPageFilterApply = () => {
    setActiveFilters(mapPageInputs);
  };

  useEffect(() => {
    if (spots.length > 0) {
      setTracksChanges(true);
      const timer = setTimeout(() => setTracksChanges(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [spots]);

  const getVibeIcon = (vibe?: string) => {
    if (!vibe) return '📍';
    switch (vibe.toLowerCase().trim()) {
      case 'romantic': return '💕';
      case 'serene': return '🌊';
      case 'creative': return '🎨';
      default: return '📍';
    }
  };

  const handleMarkerPress = (spotId: string) => {
    router.push(`/spot/${spotId}`);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('jwt');
      setIsLoggedIn(!!token);
      const userInfo = await SecureStore.getItemAsync('user');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setUserEmail(user.email || '');
        } catch {}
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('user');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={{ padding: 12, backgroundColor: '#f6f6f6', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: isLoggedIn ? 'green' : 'red', fontWeight: 'bold' }}>
          {isLoggedIn ? `Logged in${userEmail ? ' as ' + userEmail : ''}` : 'Not logged in'}
        </Text>
        {isLoggedIn && (
          <TouchableOpacity onPress={handleLogout} style={{ marginLeft: 16, backgroundColor: '#eee', padding: 8, borderRadius: 6 }}>
            <Text style={{ color: '#d00', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      <MapView
        style={styles.map}
        region={{
          ...GWALIOR_COORDS,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        initialRegion={{
          ...GWALIOR_COORDS,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
      >
        {spots.map((spot) => {
          const lat = spot.coordinates.coordinates[1];
          const lng = spot.coordinates.coordinates[0];
          return (
            <Marker
              key={spot._id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={spot.name}
              description={spot.vibe}
              tracksViewChanges={tracksChanges}
              onPress={() => handleMarkerPress(spot._id)}
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>{getVibeIcon(spot.vibe)}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
      {!loading && spots.length === 0 && (
        <View style={styles.noSpotsContainer}>
          <Text style={styles.noSpotsText}>No spots found for these filters.</Text>
        </View>
      )}
      <TouchableOpacity style={styles.recenterButton} onPress={() => {
      }}>
        <Text style={styles.recenterButtonText}>My Location</Text>
      </TouchableOpacity>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007BFF" />
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    maxHeight: 250
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  map: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 30,
  },
  markerContainer: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'gray',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
    zIndex: 10,
  },
  recenterButtonText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  noSpotsContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  noSpotsText: {
    fontSize: 18,
    color: '#666',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 8,
  },
});







