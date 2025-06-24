import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { router } from 'expo-router';

export default function FilterScreen() {
  const [filters, setFilters] = useState({
    vibe: '',
    safety: '',
    crowd: '',
    keyword: '',
    radius: '',
  });

  const handleFilterChange = (name: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const trimmedFilters = Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, value.trim()])
    );
    router.push({ pathname: '/map', params: trimmedFilters });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Filter Spots</Text>
      <TextInput
        placeholder="Keyword"
        style={styles.input}
        value={filters.keyword}
        onChangeText={v => handleFilterChange('keyword', v)}
      />
      <TextInput
        placeholder="Vibe (e.g. romantic, serene)"
        style={styles.input}
        value={filters.vibe}
        onChangeText={v => handleFilterChange('vibe', v)}
      />
      <TextInput
        placeholder="Min Safety (1-5)"
        style={styles.input}
        keyboardType="numeric"
        value={filters.safety}
        onChangeText={v => handleFilterChange('safety', v)}
      />
      <TextInput
        placeholder="Max Crowd (1-5)"
        style={styles.input}
        keyboardType="numeric"
        value={filters.crowd}
        onChangeText={v => handleFilterChange('crowd', v)}
      />
      <TextInput
        placeholder="Radius (km)"
        style={styles.input}
        keyboardType="numeric"
        value={filters.radius}
        onChangeText={v => handleFilterChange('radius', v)}
      />
      <Button title="Apply Filters" onPress={handleApplyFilters} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    width: 250,
  },
}); 