import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { addSpot } from '../utils/api';

const vibeOptions = [
  { label: 'Romantic', emoji: '💕' },
  { label: 'Serene', emoji: '🌊' },
  { label: 'Creative', emoji: '🎨' },
  { label: 'Other', emoji: '📍' },
];

export default function AddSpotScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vibe, setVibe] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualLocation, setManualLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const router = useRouter();

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setImages(result.assets.map(asset => asset.uri));
    }
  };

  const handleManualLocation = () => {
    Alert.alert('Manual Location', 'Manual location picker coming soon!');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !vibe.trim() || !description.trim()) {
      Alert.alert('Missing Info', 'Please fill out the name, vibe, and description.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('vibe', vibe);
      formData.append('description', description);
      const coordinatesString = JSON.stringify({
        type: 'Point',
        coordinates: [manualLocation?.longitude || 0, manualLocation?.latitude || 0],
      });
      formData.append('coordinates', coordinatesString);
      if (images.length > 0) {
        images.forEach((imgUri, idx) => {
          const uriParts = imgUri.split('/');
          const fileName = uriParts[uriParts.length - 1];
          formData.append('images', {
            uri: imgUri,
            name: fileName,
            type: 'image/jpeg',
          } as any);
        });
      }
      await addSpot(formData);
      Alert.alert('Success!', 'Your hidden spot has been added.');
      router.back();
    } catch (error) {
      console.error("Detailed Add Spot Error:", JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Could not submit your spot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add a New Hidden Spot</Text>
      <Text style={styles.label}>Spot Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Secret Waterfall"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Vibe</Text>
      <View style={styles.vibePickerRow}>
        {vibeOptions.map(opt => (
          <TouchableOpacity
            key={opt.label}
            style={[styles.vibeOption, vibe === opt.label ? styles.vibeOptionSelected : null]}
            onPress={() => setVibe(opt.label)}
          >
            <Text style={styles.vibeEmoji}>{opt.emoji}</Text>
            <Text style={styles.vibeLabel}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Tell us what makes this spot special..."
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImages}>
        <Text style={styles.imagePickerText}>Pick Images (up to 5)</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.previewImage} />
        ))}
      </View>
      <TouchableOpacity style={styles.locationBtn} onPress={handleManualLocation}>
        <Text style={styles.locationBtnText}>Select Location Manually (optional)</Text>
      </TouchableOpacity>
      <Button title={isSubmitting ? "Submitting..." : "Submit Spot"} onPress={handleSubmit} disabled={isSubmitting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '30%',
    height: 200,
    borderRadius: 5,
    margin: 5,
  },
  vibePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  vibeOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f6f6f6',
    borderWidth: 1,
    borderColor: '#eee',
    flex: 1,
    marginHorizontal: 4,
  },
  vibeOptionSelected: {
    backgroundColor: '#ffe066',
    borderColor: '#ffd700',
  },
  vibeEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  vibeLabel: {
    fontSize: 14,
    color: '#222',
  },
  locationBtn: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15,
  },
  locationBtnText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});
