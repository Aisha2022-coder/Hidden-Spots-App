import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { getFeedSpots } from '../../utils/api';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import React from 'react';

type Spot = {
  _id: string;
  name: string;
  vibe: string;
  description: string;
  images?: string[];
  compositeScore?: number;
};

const SpotCard = ({ name, vibe, description, images, compositeScore, _id }: Spot) => (
  <View style={styles.card} onTouchEnd={() => router.push(`/spot/${_id}`)}>
    {images && images.length > 0 && (
      <Image source={{ uri: images[0] }} style={styles.cardImage} />
    )}
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{name}</Text>
      <Text style={styles.cardVibe}>{vibe}</Text>
      {typeof compositeScore === 'number' && (
        <Text style={styles.cardScore}>⭐ {compositeScore.toFixed(1)} / 5.0</Text>
      )}
      <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text>
    </View>
  </View>
);

export default function HomeFeedScreen() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const data = await getFeedSpots();
      setSpots(data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchFeed();
    }, [])
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={spots}
        renderItem={({ item }) => <SpotCard {...item} />}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Top Rated Spots</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  list: {
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardVibe: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  cardScore: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#E6A400',
    marginTop: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 10,
    color: '#444',
  },
}); 