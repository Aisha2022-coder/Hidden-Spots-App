import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { loginUser } from '../utils/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      await SecureStore.setItemAsync('jwt', data.token);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      router.replace('/');
    } catch (err) {
      let msg = 'Login failed';
      if (typeof err === 'object' && err && 'message' in err) {
        msg = (err as any).message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => router.push({ pathname: '/register' as any })} style={styles.linkBtn}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fafafa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#222',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  linkBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
}); 