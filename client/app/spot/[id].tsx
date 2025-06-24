import React from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, Button, Alert, Switch, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { getSpotById, addComment, addRating, flagSpot } from '../../utils/api';
import Slider from '@react-native-community/slider';

type Spot = {
  _id: string;
  name: string;
  vibe: string;
  description: string;
  images: string[];
  ratings: {
    uniqueness: number;
    vibe: number;
    safety: number;
    crowd: number;
  };
  comments: {
    user: string;
    text: string;
    isAnonymous: boolean;
    timestamp: Date;
  }[];
  compositeScore?: number;
  flagged: boolean;
};

const vibeEmojis: Record<string, string> = {
  Romantic: '💕',
  Serene: '🌊',
  Creative: '🎨',
  Other: '📍',
};

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [ratings, setRatings] = useState({ uniqueness: 3, vibe: 3, safety: 3, crowd: 3 });
  const [isAnonymous, setIsAnonymous] = useState(false);

  const fetchSpot = async () => {
    if (id) {
      setLoading(true);
      const data = await getSpotById(id);
      setSpot(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpot();
  }, [id]);

  useEffect(() => {
    if (spot && spot.name) {
      navigation.setOptions({ title: spot.name });
    }
  }, [spot, navigation]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Empty Comment', 'Please write something.');
      return;
    }
    await addComment(id, { text: newComment, user: isAnonymous ? 'Anonymous' : 'User', isAnonymous });
    setNewComment('');
    fetchSpot(); 
  };

  const handleAddRating = async () => {
    const newRatings = {
      uniqueness: parseInt(ratings.uniqueness.toString(), 10),
      vibe: parseInt(ratings.vibe.toString(), 10),
      safety: parseInt(ratings.safety.toString(), 10),
      crowd: parseInt(ratings.crowd.toString(), 10),
    };
    if (Object.values(newRatings).some(isNaN)) {
      Alert.alert('Invalid Rating', 'Please enter numbers for ratings.');
      return;
    }
    await addRating(id, newRatings);
    fetchSpot(); 
  };

  const handleFlagSpot = async () => {
    if (!spot) return;
    Alert.alert(
      'Flag Spot',
      'Are you sure you want to flag this spot as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          style: 'destructive',
          onPress: async () => {
            try {
              await flagSpot(spot._id, 'Inappropriate content');
              Alert.alert('Flagged', 'This spot has been flagged for review.');
              fetchSpot();
            } catch (e) {
              Alert.alert('Error', 'Failed to flag spot.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (!spot) {
    return (
      <View style={styles.centered}>
        <Text>Spot not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {spot.images.map((item, idx) => (
          <Image key={item + idx} source={{ uri: item }} style={styles.image} contentFit="cover" />
        ))}
      </ScrollView>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{spot.name}</Text>
        <Text style={styles.vibe}>
          Vibe: {vibeEmojis[spot.vibe] || vibeEmojis.Other} {spot.vibe}
        </Text>
        <Text style={styles.description}>
          {spot.description || 'No description available.'}
        </Text>
        {typeof spot.compositeScore === 'number' && (
          <Text style={styles.compositeScore}>Composite Score: {spot.compositeScore.toFixed(2)}/5</Text>
        )}
        <Button
          title={spot.flagged ? 'Flagged for Review' : 'Flag as Inappropriate'}
          onPress={handleFlagSpot}
          color={spot.flagged ? '#aaa' : '#d00'}
          disabled={spot.flagged}
        />
      </View>
      <View style={styles.ratingsContainer}>
        <Text style={styles.sectionTitle}>Community Ratings</Text>
        {spot.ratings ? (
          <>
            <Text style={styles.ratingText}>Uniqueness: {spot.ratings.uniqueness || 'N/A'}/5</Text>
            <Text style={styles.ratingText}>Vibe: {spot.ratings.vibe || 'N/A'}/5</Text>
            <Text style={styles.ratingText}>Safety: {spot.ratings.safety || 'N/A'}/5</Text>
            <Text style={styles.ratingText}>Crowd: {spot.ratings.crowd || 'N/A'}/5</Text>
          </>
        ) : (
          <Text style={styles.ratingText}>No ratings yet.</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>Leave a Rating (1-5)</Text>
        <Text style={styles.label}>Uniqueness: {ratings.uniqueness}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={ratings.uniqueness}
          onValueChange={(val: number) => setRatings(r => ({ ...r, uniqueness: val }))}
        />
        <Text style={styles.label}>Vibe: {ratings.vibe}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={ratings.vibe}
          onValueChange={(val: number) => setRatings(r => ({ ...r, vibe: val }))}
        />
        <Text style={styles.label}>Safety: {ratings.safety}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={ratings.safety}
          onValueChange={(val: number) => setRatings(r => ({ ...r, safety: val }))}
        />
        <Text style={styles.label}>Crowd: {ratings.crowd}</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={5}
          step={1}
          value={ratings.crowd}
          onValueChange={(val: number) => setRatings(r => ({ ...r, crowd: val }))}
        />
        <Button title="Submit Rating" onPress={handleAddRating} />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>Share Your Story</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
          <Text style={styles.label}>{isAnonymous ? 'Anonymous' : 'Public'}</Text>
        </View>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Write your comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          placeholderTextColor="#888"
        />
        <Button title="Post Comment" onPress={handleAddComment} />
      </View>
      <Text style={styles.sectionTitle}>Stories & Comments</Text>
      {spot.comments && spot.comments.length > 0 ? (
        spot.comments.map((item, index) => (
          <View style={styles.comment} key={index}>
            <Text style={styles.commentUser}>{item.isAnonymous ? 'Anonymous' : item.user}</Text>
            <Text style={styles.commentText}>{item.text}</Text>
            <Text style={styles.commentTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.commentText}>No comments yet. Be the first to share your story!</Text>
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingBottom: 40,
    backgroundColor: '#fafafa',
  },
  image: {
    width: width,
    height: 300,
    backgroundColor: '#eee',
  },
  detailsContainer: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  vibe: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 10,
    color: '#222',
  },
  description: {
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: '#ffe066',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  ratingsContainer: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingText: {
    color: '#222',
    fontSize: 16,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  comment: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222',
  },
  commentText: {
    color: '#222',
    fontSize: 15,
  },
  inputContainer: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#222',
  },
  label: {
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
  },
  compositeScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 10,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
