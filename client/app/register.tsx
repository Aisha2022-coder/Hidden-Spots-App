import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../utils/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await registerUser(username, email, password);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => router.replace('/login'), 1200);
    } catch (err) {
      let msg = 'Registration failed';
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
      <Text style={styles.header}>Register</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
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
      <Button title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} disabled={loading} />
      <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkBtn}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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
  success: {
    color: 'green',
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